import type { UploadDocumentSide } from '../api';
import type { IdDocImageProcessingError } from './id-doc-image-error';

export type ProcessDocRequest = {
  authToken: string;
  id: string;
};

export type ProcessDocResponse = {
  errors: IdDocImageProcessingError[];
  nextSideToCollect: UploadDocumentSide;
  isRetryLimitExceeded: boolean;
};
