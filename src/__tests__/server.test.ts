import { UsersDatabase } from '../database/database';
import { HTTP_METHODS } from '../server/constants';
import { Api } from '../server/server';
import http from 'http';
import { UserData } from '../utils/types';

describe('API tests', () => {
  const db = new UsersDatabase();
  const api = new Api();
  const server = api.createServer(db);
  const TEST_PORT = 5500;
  const BASE_URL = `http://localhost:${TEST_PORT}`;

  server.listen(TEST_PORT);

  afterAll(() => {
    server.close();
  });

  // Test for GET /api/users
  it('GET /api/users - should return an empty array and status code 200', (done) => {
    http.get(`${BASE_URL}/api/users`, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const responseData = JSON.parse(data);

        expect(res.statusCode).toStrictEqual(200);
        expect(responseData).toStrictEqual({ data: [] });
        done();
      });
    });
  });

  // Test for POST /api/users
  it('POST /api/users - should create a new user, return it and status code 201', (done) => {
    const requestOptions: http.RequestOptions = {
      method: HTTP_METHODS.POST,
      headers: {
        'content-type': 'application/json',
      },
    };

    const newUser: UserData = {
      username: 'Roby',
      age: 34,
      hobbies: ['skiing'],
    };

    const req = http.request(`${BASE_URL}/api/users`, requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const responseData = JSON.parse(data);

        expect(res.statusCode).toStrictEqual(201);
        expect(responseData.data.message).toBe('User created successfully');
        expect(responseData.data.user).toEqual(
          expect.objectContaining(newUser)
        );

        done();
      });
    });

    req.write(JSON.stringify(newUser));
    req.end();
  });

  // Test for GET /api/users/userId
  it('GET /api/users/userId - should return created user', (done) => {
    const requestOptions: http.RequestOptions = {
      method: HTTP_METHODS.POST,
      headers: {
        'content-type': 'application/json',
      },
    };

    const newUser: UserData = {
      username: 'Lily',
      age: 29,
      hobbies: ['music', 'dancing'],
    };

    const req = http.request(`${BASE_URL}/api/users`, requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        expect(res.statusCode).toStrictEqual(201);
        const responseData = JSON.parse(data);
        const userId = responseData.data.user.id;

        http.get(`${BASE_URL}/api/users/${userId}`, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            const responseData = JSON.parse(data);

            expect(res.statusCode).toStrictEqual(200);
            expect(responseData).toStrictEqual({
              data: { id: userId, ...newUser },
            });
            done();
          });
        });
      });
    });

    req.write(JSON.stringify(newUser));
    req.end();
  });
});
