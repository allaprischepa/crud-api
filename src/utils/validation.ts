import { UserData } from './types';

function emptyUserData(data: UserData) {
  if (data.username || data.age || data.hobbies) return false;

  return true;
}

function allRequiredUserData(data: UserData) {
  return data.username && data.age && data.hobbies;
}

export function validUserData(data: UserData, allRequired = true) {
  if (allRequired && !allRequiredUserData(data)) return false;
  else if (emptyUserData(data)) return false;

  if (data.username && typeof data.username !== 'string') return false;
  if (data.age && (!Number.isInteger(data.age) || data.age < 0)) return false;
  if (
    data.hobbies &&
    (!Array.isArray(data.hobbies) ||
      !data.hobbies.every((hobby) => typeof hobby === 'string'))
  ) {
    return false;
  }

  return true;
}
