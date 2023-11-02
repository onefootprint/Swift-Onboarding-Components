import type { IdDocImageProcessingError } from '../data/id-doc-image-error';

export enum UploadDocumentSide {
  Front = 'front',
  Back = 'back',
  Selfie = 'selfie',
}

export type UploadDocRequest = {
  authToken: string;
  data: FormData;
  docId: string;
  meta: Record<string, any>;
  side?: UploadDocumentSide;
};

export type UploadDocResponse = {
  errors: IdDocImageProcessingError[];
  nextSideToCollect: UploadDocumentSide | null;
  isRetryLimitExceeded: boolean;
};
