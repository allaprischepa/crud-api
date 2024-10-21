import os from 'os';
import { Api } from './server/server';
import { env } from 'process';
import cluster, { Worker } from 'cluster';
import http, { IncomingMessage, ServerResponse } from 'http';
import { db } from './database/database';
import { ProcessMsg, RequestQueueItem, User, WorkerMsg } from './utils/types';

const PORT = (env.PORT && +env.PORT) || 3000;
const api = new Api();
const numWorkers = os.availableParallelism() - 1;

if (cluster.isPrimary) {
  // Primary process (Load Balancer)
  let currentWorkerIndex = 0;
  let workers: Worker[] = [];
  const globalDb: User[] = [];
  let workersReady = 0;
  let isDbLocked = false;
  const requestQueue: RequestQueueItem[] = [];

  function processRequestQueue() {
    if (!isDbLocked && requestQueue.length > 0) {
      const requestItem = requestQueue.shift();

      if (requestItem) proxyRequestToWorker(requestItem.req, requestItem.res);
    }
  }

  function proxyRequestToWorker(req: IncomingMessage, res: ServerResponse) {
    const workerPort = PORT + currentWorkerIndex + 1;
    const hostname = req.headers.host?.split(':')[0] || 'localhost';

    // Perform round-robin distribution
    currentWorkerIndex = (currentWorkerIndex + 1) % numWorkers;

    const options = {
      hostname,
      port: workerPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res);
    });

    req.pipe(proxyReq);

    console.log(
      `Request with method ${req.method} is sent to http://localhost:${workerPort}${req.url}`
    );
  }

  function syncDataToWorkers(data: User[]) {
    workers.forEach((w) => {
      w.send({ type: 'SYNC_DATA', data });
    });
  }

  function lockDatabase() {
    isDbLocked = true;
  }

  function unlockDatabase() {
    isDbLocked = false;
    processRequestQueue();
  }

  function handleWorkerMessage(msg: WorkerMsg) {
    lockDatabase();

    if (msg.type === 'DATA_CREATED') globalDb.push(msg.data);

    if (msg.type === 'DATA_UPDATED') {
      const userInd = globalDb.findIndex((user) => user.id === msg.data.id);
      if (userInd !== 1) globalDb[userInd] = msg.data;
    }

    if (msg.type === 'DATA_DELETED') {
      const userInd = globalDb.findIndex((user) => user.id === msg.data.id);
      if (userInd !== 1) globalDb.splice(userInd, 1);
    }

    syncDataToWorkers(globalDb);
    unlockDatabase();
  }

  function forkWorkers() {
    console.log('Waiting workers creating...');

    for (let i = 0; i < numWorkers; i++) {
      const worker = cluster.fork({ WORKER_PORT: PORT + i + 1 });
      workers.push(worker);

      worker.on('exit', (code) => {
        console.error(`Worker ${worker.id} exited with code ${code}`);
      });

      worker.on('error', (error) => {
        console.error(`Error in worker ${worker.id}: ${error}`);
      });

      worker.on('message', (msg) => handleWorkerMessage(msg));
    }
  }

  function startLoadBalancer() {
    console.log('Starting load balancer...');

    const loadBalancer = http.createServer((req, res) => {
      if (isDbLocked) {
        requestQueue.push({ req, res });
      } else {
        proxyRequestToWorker(req, res);
      }
    });

    loadBalancer.listen(PORT, () => {
      console.log(`Load balancer listening on http://localhost:${PORT}/`);
      console.log('Application is ready to use');
    });
  }

  // Fork workers
  forkWorkers();

  // Start Load balancer when all workers are listening
  cluster.on('listening', () => {
    workersReady++;
    if (workersReady === numWorkers) startLoadBalancer();
  });
} else if (cluster.isWorker) {
  // Worker process (Application logic)
  const workerPort = env.WORKER_PORT;
  const server = api.createServer(db);

  process.on('message', (msg: ProcessMsg) => {
    if (msg.type === 'SYNC_DATA') {
      db.sync(msg.data);
    }
  });

  server.listen(workerPort, () => {
    console.log(`Worker listening on http://localhost:${workerPort}/`);
  });
}
