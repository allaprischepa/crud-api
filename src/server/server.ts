import http from 'http';
import { UsersDatabase } from '../database/database';
import {
  handleApiUsers,
  handleApiUsersUserId,
  handleInternalError,
  handleNotFound,
} from './handler';

const db = new UsersDatabase();

export const server = http.createServer((req, res) => {
  const { url: originUrl, method = '' } = req;
  const urlObj = new URL(`http://localhost${originUrl}`);
  const url = urlObj.pathname;
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const userIdMatch = url && url.match(/\/api\/users\/(\S+)/);
    const userId = userIdMatch ? userIdMatch[1] : '';

    let response;

    try {
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
