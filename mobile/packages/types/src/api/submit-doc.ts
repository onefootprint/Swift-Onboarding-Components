import { CountryCode, CountryCode3, IdDocImageError, IdDocType } from '../data';

export enum SubmitDocumentSide {
  Front = 'front',
  Back = 'back',
  Selfie = 'selfie',
}

export type SubmitDocRequest = {
  authToken: string;
  frontImage?: string;
  backImage?: string;
  selfieImage?: string;
  documentType: IdDocType;
  countryCode: CountryCode | CountryCode3;
};

export type SubmitDocResponse = {
  errors: IdDocImageError[];
  nextSideToCollect: SubmitDocumentSide | null;
  isRetryLimitExceeded: boolean;
};
