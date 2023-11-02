import type { IdDocImageProcessingError } from './id-doc-image-error';
import type { IdDocImageTypes } from './id-doc-type';

export type ProcessDocRequest = {
  authToken: string;
  id: string;
};

export type ProcessDocResponse = {
  errors: IdDocImageProcessingError[];
  nextSideToCollect: IdDocImageTypes;
  isRetryLimitExceeded: boolean;
};
