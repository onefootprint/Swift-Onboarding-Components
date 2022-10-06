import { CountryCode3, IdScanDocType } from '../data';

export type SubmitDocRequest = {
  authToken: string;
  tenantPk: string;
  frontImage: string;
  backImage?: string;
  documentType: IdScanDocType;
  countryCode: CountryCode3;
};

export type SubmitDocResponse = {};
