import { DecryptedUserDataAttributes } from '../data';

export type DecryptUserRequest = {
  footprintUserId: string;
  fields: string[];
  reason: string;
  authHeaders: {
    'x-fp-dashboard-authorization': string;
    'x-is-live': string;
  };
};

export type DecryptUserResponse = DecryptedUserDataAttributes;
