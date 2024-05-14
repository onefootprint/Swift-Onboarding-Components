import type { UserData } from './user-data';

export type UserDataError = {
  error: {
    message: Partial<Record<keyof UserData, string>> | string;
  };
};
