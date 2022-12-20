import { DecryptedIdDoc, IdDocType } from '../data';

export type DecryptIdDocRequest = {
  userId: string;
  documentType: IdDocType;
  reason: string;
};

export type DecryptIdDocResponse = {
  documentType: IdDocType;
  images: DecryptedIdDoc[];
};
