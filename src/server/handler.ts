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
        db.create(userData);
        status = 201;
        data = { message: 'User created successfully' };
      } else {
        status = 401;
        data = { error: 'There are missing arguments or they have wrong type' };
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

  if (method === HTTP_METHODS.GET) {
    const user = db.getUser(userId);

    if (user) {
      status = 200;
      data = user;
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
