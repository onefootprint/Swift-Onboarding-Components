import { DecryptedUserDataAttributes } from '../data';

export type DecryptUserRequest = {
  userId: string;
  fields: string[];
  reason: string;
};

export type DecryptUserResponse = DecryptedUserDataAttributes;
