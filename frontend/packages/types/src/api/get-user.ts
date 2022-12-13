import { ScopedUser } from '../data';

export type GetUserRequest = {
  userId: string;
  authHeaders: {
    'x-fp-dashboard-authorization': string;
    'x-is-live': string;
  };
};

export type GetUserResponse = ScopedUser;
