import { UserData } from './types';

export function validUserData(data: UserData) {
  if (!data.username || typeof data.username !== 'string') return false;
  if (!data.age || !Number.isInteger(data.age) || data.age < 0) return false;
  if (
    !data.hobbies ||
    !Array.isArray(data.hobbies) ||
    !data.hobbies.every((hobby) => typeof hobby === 'string')
  ) {
    return false;
  }

  return true;
}
