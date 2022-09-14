import { DecryptedUserAttributes } from '../data';

export type DecryptUserRequest = {
  footprintUserId: string;
  fields: string[];
  reason: string;
};

export type DecryptUserResponse = DecryptedUserAttributes;
