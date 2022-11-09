import { CountryCode3, IdDocType } from '../data';

export type SubmitDocRequest = {
  authToken: string;
  tenantPk: string;
  frontImage: string;
  backImage?: string;
  documentType: IdDocType;
  countryCode: CountryCode3;
};

export type SubmitDocResponse = {};
