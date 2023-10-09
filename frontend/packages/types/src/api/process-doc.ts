import type { IdDocImageProcessingError, IdDocImageTypes } from '../data';

export type ProcessDocRequest = {
  authToken: string;
  id: string;
};

export type ProcessDocResponse = {
  errors: IdDocImageProcessingError[];
  nextSideToCollect: IdDocImageTypes;
  isRetryLimitExceeded: boolean;
};
