import { v4 as uuidv4 } from 'uuid';
import { User, UserData } from '../utils/types';

export class UsersDatabase {
  private users: User[] = [];
  private static instance: UsersDatabase;

  constructor() {
    if (UsersDatabase.instance) {
      return UsersDatabase.instance;
    }

    UsersDatabase.instance = this;
  }

  getUser(id: string): User | null {
    return this.users.find((user) => user.id === id) || null;
  }

  getAllUsers(): User[] {
    return this.users;
  }

  create({ username, age, hobbies }: UserData): User {
    const newUser = {
      id: uuidv4(),
      username,
      age,
      hobbies,
    };

    this.users.push(newUser);

    return newUser;
  }

  update(userId: string, userData: UserData): User | null {
    const userInd = this.users.findIndex((user) => user.id === userId);
    const { username, age, hobbies } = userData;

    if (userInd !== -1) {
      const user = this.users[userInd];

      if (username !== undefined) user.username = username;
      if (age !== undefined) user.age = age;
      if (hobbies !== undefined) user.hobbies = hobbies;

      return user;
    }

    return null;
  }

  delete(userId: string) {
    const userInd = this.users.findIndex((user) => user.id === userId);

    this.users.splice(userInd, 1);
  }
}
