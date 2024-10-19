import { validate } from 'uuid';
import { UsersDatabase } from '../database/database';
import { validUserData } from '../utils/validation';
import { HTTP_METHODS } from './constants';

export function handleApiUsers(
  method: string,
  body: string,
  db: UsersDatabase
) {
  let status = 200;
  let data: unknown;

  if (method === HTTP_METHODS.GET) data = db.getAllUsers();
  else if (method === HTTP_METHODS.POST) {
    try {
      const userData = (body && JSON.parse(body)) || {};

      if (validUserData(userData)) {
        const userRecord = db.create(userData);
        status = 201;
        data = {
          message: 'User created successfully',
          user: userRecord,
        };
      } else {
        status = 400;
        data = {
          error:
            'Request body does not contain required fields or they have wrong types',
        };
      }
    } catch {
      status = 400;
      data = { error: 'Invalid JSON' };
    }
  } else {
    status = 405;
    data = { error: `Method ${method} is not allowed` };
  }

  return { status, data };
}

export function handleApiUsersUserId(
  method: string,
  body: string,
  userId: string,
  db: UsersDatabase
) {
  let status = 200;
  let data: unknown;
  const allowedMethods = [
    HTTP_METHODS.GET,
    HTTP_METHODS.PUT,
    HTTP_METHODS.DELETE,
  ];

  if (allowedMethods.includes(method)) {
    const user = db.getUser(userId);

    if (user) {
      if (method === HTTP_METHODS.GET) {
        data = user;
      } else if (method === HTTP_METHODS.PUT) {
        try {
          const userData = (body && JSON.parse(body)) || {};

          if (validUserData(userData)) {
            const userRecord = db.update(userId, userData);
            data = {
              message: 'User updated successfully',
              user: userRecord,
            };
          } else {
            status = 401;
            data = {
              error:
                'Request body does not contain required fields or they have wrong types',
            };
          }
        } catch {
          status = 400;
          data = { error: 'Invalid JSON' };
        }
      } else if (method === HTTP_METHODS.DELETE) {
        db.delete(userId);
        status = 204;
      }
    } else if (validate(userId)) {
      status = 404;
      data = { error: `User with id: ${userId} is not found` };
    } else {
      status = 400;
      data = { error: `Id: ${userId} is not a valid uuid` };
    }
  } else {
    status = 405;
    data = { error: `Method ${method} is not allowed` };
  }

  return { status, data };
}

export function handleNotFound() {
  return {
    status: 404,
    data: { error: 'Not Found' },
  };
}

export function handleInternalError(error: unknown) {
  let errorMsg = 'Internal Server Error';

  if (error instanceof Error && error.message) {
    errorMsg += `. Cause: ${error.message}`;
  }

  return {
    status: 500,
    data: { error: errorMsg },
  };
}
