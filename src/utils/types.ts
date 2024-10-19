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
