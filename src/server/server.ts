import http from 'http';
import { UsersDatabase } from '../database/database';
import { handleApiUsers, handleApiUsersUserId } from './handler';

const db = new UsersDatabase();

export const server = http.createServer((req, res) => {
  const { url, method = '' } = req;
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const userIdMatch = url && url.match(/\/api\/users\/(\S+)/);
    const userId = userIdMatch ? userIdMatch[1] : '';

    let response;

    try {
      if (url === '/api/users') response = handleApiUsers(method, body, db);
      else if (url === `/api/users/${userId}`) {
        response = handleApiUsersUserId(method, body, userId, db);
      } else {
        response = {
          status: 404,
          data: { error: 'Not Found' },
        };
      }
    } catch (error) {
      let errorMsg = 'Internal Server Error';

      if (error instanceof Error && error.message) {
        errorMsg += `. Cause: ${error.message}`;
      }

      response = {
        status: 500,
        data: { error: errorMsg },
      };
    }

    res.writeHead(response.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ data: response.data }));
  });
});
