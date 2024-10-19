import os from 'os';
import { Api } from './server/server';
import { env } from 'process';
import cluster, { Worker } from 'cluster';
import http from 'http';
import { db } from './database/database';
import { ProcessMsg, User } from './utils/types';

const PORT = (env.PORT && +env.PORT) || 3000;
const api = new Api();
const numWorkers = os.availableParallelism() - 1;

if (cluster.isPrimary) {
  // Primary process (Load Balancer)
  let currentWorkerIndex = 0;
  let workers: Worker[] = [];
  const globalDb: User[] = [];
  let workersReady = 0;

  const syncDataToWorkers = (data: User[]) => {
    workers.forEach((w) => {
      w.send({ type: 'SYNC_DATA', data });
    });
  };

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

      // Increase ready count when the worker is listening
      worker.on('listening', () => {
        workersReady++;
        if (workersReady === numWorkers) startLoadBalancer();
      });

      worker.on('message', (msg) => {
        if (msg.type === 'DATA_CREATED') {
          globalDb.push(msg.data);
          syncDataToWorkers(globalDb);
        }

        if (msg.type === 'DATA_UPDATED') {
          const userInd = globalDb.findIndex((user) => user.id === msg.data.id);
          if (userInd !== 1) {
            globalDb[userInd] = msg.data;
            syncDataToWorkers(globalDb);
          }
        }

        if (msg.type === 'DATA_DELETED') {
          const userInd = globalDb.findIndex((user) => user.id === msg.data.id);
          if (userInd !== 1) {
            globalDb.splice(userInd, 1);
            syncDataToWorkers(globalDb);
          }
        }
      });
    }
  }

  function startLoadBalancer() {
    console.log('Starting load balancer...');
    const loadBalancer = http.createServer((req, res) => {
      const workerPort = PORT + currentWorkerIndex + 1;
      const hostname = req.headers.host?.split(':')[0] || 'localhost';

      // Perform round-robin distribution
      currentWorkerIndex = (currentWorkerIndex + 1) % numWorkers;

      // Proxy the request to the worker
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

      // Forward the request body
      req.pipe(proxyReq);
    });

    loadBalancer.listen(PORT, () => {
      console.log(`Load balancer listening on http://localhost:${PORT}/`);
      console.log('Application is ready to use');
    });
  }

  forkWorkers();
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

  server.on('request', (req) => {
    const { url, method = '' } = req;
    console.log(
      `Request with method ${method} is sent to http://localhost:${workerPort}${url}`
    );
  });
}
