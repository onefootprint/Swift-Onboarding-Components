import { IdDocImageError, IdDocImageTypes } from '../data';

export type SubmitDocRequest = {
  authToken: string;
  image: string;
  side: string;
  mimeType: string;
  id: string;
};

export type SubmitDocResponse = {
  errors: IdDocImageError[];
  nextSideToCollect: IdDocImageTypes;
  isRetryLimitExceeded: boolean;
};
