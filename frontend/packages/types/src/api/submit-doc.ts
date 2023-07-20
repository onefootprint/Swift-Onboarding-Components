import {
  CountryCode,
  IdDocImageError,
  IdDocImageTypes,
  IdDocType,
} from '../data';

export type SubmitDocRequest = {
  authToken: string;
  frontImage?: string;
  backImage?: string;
  selfieImage?: string;
  documentType: IdDocType;
  countryCode: CountryCode;
};

export type SubmitDocResponse = {
  errors: IdDocImageError[];
  nextSideToCollect: IdDocImageTypes;
  isRetryLimitExceeded: boolean;
};
