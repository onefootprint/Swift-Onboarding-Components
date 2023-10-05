import type { IdDocImageProcessingError, IdDocImageTypes } from '../data';

export type SubmitDocRequest = {
  authToken: string;
  image: File;
  side: string;
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
