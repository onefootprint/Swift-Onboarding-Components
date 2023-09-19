import type { IdDocImageProcessingError, IdDocImageTypes } from '../data';

export type SubmitDocRequest = {
  authToken: string;
  image: string;
  side: string;
  mimeType: string;
  id: string;
  meta: {
    manual?: boolean;
  };
};

export type SubmitDocResponse = {
  errors: IdDocImageProcessingError[];
  nextSideToCollect: IdDocImageTypes;
  isRetryLimitExceeded: boolean;
};
