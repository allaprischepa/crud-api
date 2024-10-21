import { IncomingMessage, ServerResponse } from 'http';

export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

export type UserData = Omit<User, 'id'>;

export interface ProcessMsg {
  type: string;
  data: User[];
}

export interface WorkerMsg {
  type: string;
  data: User;
}

export interface RequestQueueItem {
  req: IncomingMessage;
  res: ServerResponse;
}
