import { DecryptedUserDataAttributes } from '../data';

export type DecryptKycDataRequest = {
  userId: string;
  fields: string[];
  reason: string;
};

export type DecryptKycDataResponse = DecryptedUserDataAttributes;
