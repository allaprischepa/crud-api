import { Api } from './server/server';
import { env } from 'process';
import { UsersDatabase } from './database/database';

const PORT = (env.PORT && +env.PORT) || 3000;
const db = new UsersDatabase();
const api = new Api();
const server = api.createServer(db);

server.listen(PORT);
