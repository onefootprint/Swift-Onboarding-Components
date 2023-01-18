import { CountryCode3, IdDocType } from '../data';

export type SubmitDocRequest = {
  authToken: string;
  frontImage: string;
  backImage?: string;
  selfieImage?: string;
  documentType: IdDocType;
  countryCode: CountryCode3;
  requestId: string;
};

export type SubmitDocResponse = {};
