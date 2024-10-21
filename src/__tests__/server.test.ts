import { UsersDatabase } from '../database/database';
import { Api } from '../server/server';
import { UserData } from '../utils/types';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';

const db = new UsersDatabase();
const api = new Api();
const TEST_PORT = 5500;

describe('API test scenario #1', () => {
  let userId = '';
  const userDataToCreate: UserData = {
    username: 'Roby',
    age: 34,
    hobbies: ['skiing'],
  };
  const server = api.createServer(db);
  server.listen(TEST_PORT);

  afterAll(() => {
    server.close();
  });

  // Test for GET /api/users
  it('GET /api/users - should return an empty array and code 200', (done) => {
    request(server).get(`/api/users`).expect(200, { data: [] }, done);
  });

  // Test for POST /api/users
  it('POST /api/users - should create a new user, return it and code 201', (done) => {
    request(server)
      .post('/api/users')
      .send(userDataToCreate)
      .set('Accept', 'application/json')
      .expect(201)
      .then((response) => {
        const { message, user } = response.body.data;
        userId = user.id;

        expect(message).toBe('User created successfully');
        expect(user).toStrictEqual({ id: userId, ...userDataToCreate });
        done();
      });
  });

  // Test for GET /api/users/userId
  it('GET /api/users/userId - should return previously created user and code 200', (done) => {
    request(server)
      .get(`/api/users/${userId}`)
      .expect(200)
      .then((response) => {
        const user = response.body.data;

        expect(user).toStrictEqual({ id: userId, ...userDataToCreate });
        done();
      });
  });

  // Test for PUT /api/users/userId
  it('PUT /api/users/userId - should return updated user and code 200', (done) => {
    const userDataToUpdate = {
      username: 'Roby N',
      age: 35,
      hobbies: ['skiing', 'tennis'],
    };

    request(server)
      .put(`/api/users/${userId}`)
      .send(userDataToUpdate)
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        const { message, user } = response.body.data;

        expect(message).toBe('User updated successfully');
        expect(user).toStrictEqual({ id: userId, ...userDataToUpdate });
        done();
      });
  });

  // Test for DELETE /api/users/userId
  it('DELETE /api/users/userId - should delete the user and return code 204', (done) => {
    request(server).delete(`/api/users/${userId}`).expect(204, done);
  });

  // Test for GET /api/users/userId
  it('GET /api/users/userId - should return code 404 and an error message', (done) => {
    request(server)
      .get(`/api/users/${userId}`)
      .expect(404)
      .then((response) => {
        const { error } = response.body.data;

        expect(error).toBe(`User with id: ${userId} is not found`);
        done();
      });
  });
});

describe('API test scenario #2', () => {
  const invalidUserId = 'invalid-uuid';
  const server = api.createServer(db);
  server.listen(TEST_PORT + 1);

  afterAll(() => {
    server.close();
  });

  // Test for GET /api/users/invalidUserId
  it('GET /api/users/invalidUserId - should return code 400 for the invalid UUID', (done) => {
    request(server)
      .get(`/api/users/${invalidUserId}`)
      .expect(400)
      .then((response) => {
        const { error } = response.body.data;

        expect(error).toBe(`Id: ${invalidUserId} is not a valid uuid`);
        done();
      });
  });

  // Test for POST /api/users with missing fields
  it('POST /api/users - should return code 400 when required fields are missing', (done) => {
    const incompleteUserData = { age: 25 };

    request(server)
      .post(`/api/users`)
      .send(incompleteUserData)
      .set('Accept', 'application/json')
      .expect(400)
      .then((response) => {
        const { error } = response.body.data;

        expect(error).toBe(
          'Request body does not contain required fields or they have wrong types'
        );
        done();
      });
  });

  // Test for PUT /api/users/invalidUserId
  it('PUT /api/users/invalidUserId - should return code 400 for an invalid UUID', (done) => {
    const userDataToUpdate = {
      username: 'Roby S',
      age: 20,
      hobbies: ['tennis', 'football'],
    };

    request(server)
      .put(`/api/users/${invalidUserId}`)
      .send(userDataToUpdate)
      .set('Accept', 'application/json')
      .expect(400)
      .then((response) => {
        const { error } = response.body.data;

        expect(error).toBe(`Id: ${invalidUserId} is not a valid uuid`);
        done();
      });
  });

  // Test for DELETE /api/users/invalidUserId
  it('DELETE /api/users/invalidUserId - should return code 400 for an invalid UUID', (done) => {
    request(server)
      .delete(`/api/users/${invalidUserId}`)
      .expect(400)
      .then((response) => {
        const { error } = response.body.data;

        expect(error).toBe(`Id: ${invalidUserId} is not a valid uuid`);
        done();
      });
  });
});

describe('API test scenario #3', () => {
  const validUuid = uuidv4();
  const server = api.createServer(db);
  server.listen(TEST_PORT + 2);

  afterAll(() => {
    server.close();
  });

  // Test for GET /api/users/validUuid
  it('GET /api/users/validUuid - should return code 404 and error message, while there are no users', (done) => {
    request(server)
      .get(`/api/users/${validUuid}`)
      .expect(404)
      .then((response) => {
        const { error } = response.body.data;

        expect(error).toBe(`User with id: ${validUuid} is not found`);
        done();
      });
  });

  // Test for PUT /api/users/validUuid
  it('PUT /api/users/validUuid - should return 404 and error message, while there are no users', (done) => {
    const userDataToUpdate = {
      username: 'Roby S',
      age: 20,
      hobbies: ['tennis', 'football'],
    };

    request(server)
      .put(`/api/users/${validUuid}`)
      .send(userDataToUpdate)
      .set('Accept', 'application/json')
      .expect(404)
      .then((response) => {
        const { error } = response.body.data;

        expect(error).toBe(`User with id: ${validUuid} is not found`);
        done();
      });
  });

  // Test for DELETE /api/users/validUuid
  it('DELETE /api/users/validUuid - should return code 404 and error message, while there are no users', (done) => {
    request(server)
      .delete(`/api/users/${validUuid}`)
      .expect(404)
      .then((response) => {
        const { error } = response.body.data;

        expect(error).toBe(`User with id: ${validUuid} is not found`);
        done();
      });
  });
});

describe('API test scenario #4', () => {
  let userId1 = '';
  let userId2 = '';
  const userData1 = {
    username: 'Alice',
    age: 30,
    hobbies: ['reading', 'cycling'],
  };
  const userData2 = {
    username: 'Bob',
    age: 28,
    hobbies: ['gaming', 'cooking'],
  };
  const server = api.createServer(db);
  server.listen(TEST_PORT + 3);

  afterAll(() => {
    server.close();
  });

  // Test for POST /api/users - create multiple users
  it('POST /api/users - should create multiple users', async () => {
    const response1 = await request(server)
      .post('/api/users')
      .send(userData1)
      .set('Accept', 'application/json')
      .expect(201);
    userId1 = response1.body.data.user.id;

    const response2 = await request(server)
      .post('/api/users')
      .send(userData2)
      .set('Accept', 'application/json')
      .expect(201);
    userId2 = response2.body.data.user.id;
  });

  // Test for GET /api/users - fetch all users
  it('GET /api/users - should return all created users', (done) => {
    request(server)
      .get('/api/users')
      .expect(200)
      .then((response) => {
        const users = response.body.data;

        expect(users).toEqual(
          expect.arrayContaining([
            { id: userId1, ...userData1 },
            { id: userId2, ...userData2 },
          ])
        );
        expect(users.length).toEqual(2);
        done();
      });
  });

  // Test for DELETE /api/users/userId1 - delete one user
  it('DELETE /api/users/userId1 - should delete user with userId1', (done) => {
    request(server).delete(`/api/users/${userId1}`).expect(204, done);
  });

  // Test for GET /api/users/userId1 - ensure user1 no longer exists
  it('GET /api/users/userId1 - should return code 404 for deleted user', (done) => {
    request(server)
      .get(`/api/users/${userId1}`)
      .expect(404)
      .then((response) => {
        const { error } = response.body.data;

        expect(error).toBe(`User with id: ${userId1} is not found`);
        done();
      });
  });

  // Test for GET /api/users - ensure other user still exists
  it('GET /api/users - should return remaining users', (done) => {
    request(server)
      .get('/api/users')
      .expect(200)
      .then((response) => {
        const users = response.body.data;

        expect(users).toStrictEqual([{ id: userId2, ...userData2 }]);
        done();
      });
  });
});
