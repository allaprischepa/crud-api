import http from 'http';
import { UsersDatabase } from '../database/database';
import {
  handleApiUsers,
  handleApiUsersUserId,
  handleInternalError,
  handleNotFound,
} from './handler';

export class Api {
  createServer(db: UsersDatabase) {
    return http.createServer((req, res) => {
      const { url: originUrl, method = '' } = req;
      const host = req.headers.host || 'localhost';
      const urlObj = new URL(`http://${host}${originUrl}`);
      const url = urlObj.pathname;
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        let response;

        try {
          const userIdMatch = url && url.match(/\/api\/users\/(\S+)/);
          const userId = userIdMatch ? userIdMatch[1] : '';

          if (url === '/api/users') {
            response = handleApiUsers(method, body, db);
          } else if (url === `/api/users/${userId}`) {
            response = handleApiUsersUserId(method, body, userId, db);
          } else {
            response = handleNotFound();
          }
        } catch (error) {
          response = handleInternalError(error);
        }

        res.writeHead(response.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: response.data }));
      });
    });
  }
}
