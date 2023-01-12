import { ScopedUser } from '../data';

export type UsersRequest = {
  fingerprint?: string;
};

export type UsersResponse = ScopedUser[];
