import http from 'http';
import { UsersDatabase } from '../database/database';
import { HTTP_METHODS } from './constants';
import { validate } from 'uuid';

const db = new UsersDatabase();

export const server = http.createServer((req, res) => {
  const { url, method } = req;
  let statusCode = 404;
  let resBody: unknown;
  let reqBody = '';

  req.on('data', (chunk) => {
    reqBody += chunk.toString();
  });

  req.on('end', () => {
    const userIdMatch = url && url.match(/\/api\/users\/(\S+)/);
    const userId = userIdMatch ? userIdMatch[1] : '';

    switch (url) {
      case '/api/users':
        if (method === HTTP_METHODS.GET) {
          statusCode = 200;
          resBody = db.getAllUsers();
        }
        if (method === HTTP_METHODS.POST) {
          const postObj = JSON.parse(reqBody);

          console.log(postObj);
        }
        break;
      case `/api/users/${userId}`: {
        console.log('here');
        if (method === HTTP_METHODS.GET) {
          const user = db.getUser(userId);

          if (user) {
            statusCode = 200;
            resBody = user;
          } else if (validate(userId)) {
            statusCode = 404;
            resBody = `User with id: ${userId} is not found`;
          } else {
            statusCode = 400;
            resBody = `Id: ${userId} is not a valid uuid`;
          }
        }
        break;
      }
      default:
    }

    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        data: resBody,
      })
    );
  });
});
