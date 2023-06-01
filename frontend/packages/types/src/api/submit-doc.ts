import { CountryCode, CountryCode3, IdDocImageError, IdDocType } from '../data';

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
  nextSideToCollect: 'front' | 'back' | 'selfie';
};
