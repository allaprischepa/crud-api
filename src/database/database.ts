import { v4 as uuidv4 } from 'uuid';
import { User } from '../types/types';

export class UsersDatabase {
  private users: User[] = [];

  getUser(id: string): User | null {
    return this.users.find((user) => user.id === id) || null;
  }

  getAllUsers(): User[] {
    return this.users;
  }

  create({ username, age, hobbies }: User) {
    const newUser = {
      id: uuidv4(),
      username,
      age,
      hobbies,
    };

    this.users.push(newUser);
  }
}
