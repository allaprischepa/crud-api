import { db } from './database/database';
import { Api } from './server/server';
import { env } from 'process';

const PORT = (env.PORT && +env.PORT) || 3000;
const api = new Api();
const server = api.createServer(db);

server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}/`);
});
