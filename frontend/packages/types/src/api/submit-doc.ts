import { CountryCode3, IdDocType } from '../data';

export type SubmitDocRequest = {
  authToken: string;
  frontImage: string;
  backImage?: string;
  documentType: IdDocType;
  countryCode: CountryCode3;
  documentRequestId: string;
};

export type SubmitDocResponse = {};
