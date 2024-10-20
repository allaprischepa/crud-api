# CRUD API Application

## Description

This project is a simple CRUD API that manages user data using an in-memory database. The API supports user creation, retrieval, updating, and deletion, and includes support for horizontal scaling with multiple worker processes using the Node.js Cluster API.

## Table of Contents

- [Installation](#installation)
- [Running the Application](#running-the-application)
  - [Development Mode](#development-mode)
  - [Production Mode](#production-mode)
  - [Multi-Process Mode](#multi-process-mode)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Testing](#testing)

---

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/allaprischepa/crud-api.git
    cd crud-api
    ```

2. **Select develop branch**:  
    ```bash
    git checkout develop
    ```

3. **Install dependencies**:
    Make sure you are using Node.js version 22.x.x (22.9.0 or higher).
    ```bash
    npm install
    ```

4. **Set up the environment**:  
    Create a `.env` file at the root of the project based on the `.env.example` file.  
    The `.env.example` contains an example of how to define the port on which the application will run:  
    ```
    PORT=4000
    ```
    If `PORT` variable is not provided, the application will use port `3000`;
---

## Running the Application

The application can be run in three modes: **development**, **production**, and **multi-process** mode.

### Development Mode

In development mode, the server will automatically restart when changes are detected. Use the following command:

```bash
npm run start:dev
```

The server will run on the port defined in your `.env` file.

### Production Mode

To run the application in production mode use the command:

```bash
npm run start:prod
```

This will bundle the application using Webpack and run the output.

### Multi-Process Mode

To run the application with multiple worker processes and load balancing:

```bash
npm run start:multi
```

This will create multiple worker instances based on the available CPU cores and a load balancer to distribute requests among them.  
The load balancer will listen on the port defined in your `.env` file, while each worker will listen on incremented port numbers (e.g., 4001, 4002, etc.).

---

## Environment Variables

Create a `.env` file to configure the application port. Example:

```
PORT=4000
```

- `PORT`: The port on which the application will listen requests.

---

## API Endpoints

You can perform requests using tools like Postman, curl, or similar.  
Here is a list of available API endpoints:

### `GET /api/users`

- Fetches all users from the in-memory database.
- **Response**: 
  - Status Code: `200 OK`
  - Body: Array of user objects.

Example of the request:  
```bash
curl --location 'localhost:4000/api/users'
```

### `GET /api/users/{userId}`

- Fetches a specific user by `userId`.
- **Response**:
  - When `User found`:
      - Status Code: `200 OK`
      - Body: Found User object.
  - When `userId is invalid (not a UUID)`:
      - Status Code: `400 Bad Request`
      - Body: Error message.
  - When `User not found`:
      - Status Code: `404 Not Found`
      - Body: Error message.

Example of the request:  
```bash
curl --location 'localhost:4000/api/users/49b1ad4a-c13b-4630-9db2-c328ad1de0a0'
```

### `POST /api/users`

- Creates a new user.
- **Request Body**:  
  JSON object with the following data: 
  - `username` (string) - Required.
  - `age` (number) - Required.
  - `hobbies` (array of strings) - Required (can be an empty array).
- **Response**:
  - When `All required data is provided and valid`:
      - Status Code: `201 Created`
      - Body: Success message and a newly created User object.
  - When `Missing or invalid required fields`:
      - Status Code: `400 Bad Request`
      - Body: Error message.

Example of the request:  
```bash
curl --location 'localhost:4000/api/users' \
--header 'Content-Type: application/json' \
--data '{
    "username": "Mike",
    "age": 25,
    "hobbies": ["playing guitar", "hiking"]
}'
```

### `PUT /api/users/{userId}`

- Updates an existing user.
- **Request Body**:  
  JSON object with the following data: 
  - `username` (string) - Required.
  - `age` (number) - Required.
  - `hobbies` (array of strings) - Required (can be an empty array).
- **Response**:
  - When `User found` and `All required data is provided and valid`:
      - Status Code: `200 OK`
      - Body: Success message and an updated User object.
  - When `userId is invalid (not a UUID)`:
      - Status Code: `400 Bad Request`
      - Body: Error message.
  - When `User not found`:
      - Status Code: `404 Not Found`
      - Body: Error message.

Example of the request:  
```bash
curl --location --request PUT 'localhost:4000/api/users/49b1ad4a-c13b-4630-9db2-c328ad1de0a0' \
--header 'Content-Type: application/json' \
--data '{
    "username": "Mike",
    "age": 30,
    "hobbies": ["football"]
}'
```

### `DELETE /api/users/{userId}`

- Deletes an existing user.
- **Response**:
- **Response**:
  - When `User found`:
      - Status Code: `204 No Content`
  - When `userId is invalid (not a UUID)`:
      - Status Code: `400 Bad Request`
      - Body: Error message.
  - When `User not found`:
      - Status Code: `404 Not Found`
      - Body: Error message.

Example of the request:  
```bash
curl --location --request DELETE 'localhost:4000/api/users/49b1ad4a-c13b-4630-9db2-c328ad1de0a0'
```
---

## Error Handling
The following errors are handled by the API:

- `404 Not Found`: Returned for non-existing endpoints.
- `400 Bad Request`: Returned for invalid input, such as an incorrect userId or missing required fields.
- `500 Internal Server Error`: Returned for server-side issues during request processing.

## Testing

To run the tests, you can use the following command:

```bash
npm run test
```
