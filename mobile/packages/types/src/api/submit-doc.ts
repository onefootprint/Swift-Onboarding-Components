import { CountryCode, CountryCode3, SupportedIdDocTypes } from '../data';

export type SubmitDocTypeRequest = {
  authToken: string;
  documentType: SupportedIdDocTypes;
  countryCode: CountryCode | CountryCode3;
};

export type SubmitDocTypeResponse = {
  errors: string[];
  id: string;
};
