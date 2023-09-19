import { IdDocImageError } from '../data';

export enum UploadDocumentSide {
  Front = 'front',
  Back = 'back',
  Selfie = 'selfie',
}

export type UploadDocRequest = {
  authToken: string;
  docId: string;
  side?: UploadDocumentSide;
  image: string;
  mimeType: string;
  meta: Record<string, any>;
};

export type UploadDocResponse = {
  errors: IdDocImageError[];
  nextSideToCollect: UploadDocumentSide | null;
  isRetryLimitExceeded: boolean;
};
