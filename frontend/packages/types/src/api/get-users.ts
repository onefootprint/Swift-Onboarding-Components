import { ScopedUser } from '../data';

export type UsersRequest = {
  search?: string;
};

export type UsersResponse = ScopedUser[];
