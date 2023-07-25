import { CountryCode, SupportedIdDocTypes } from '../data';

export type SubmitDocTypeRequest = {
  authToken: string;
  documentType: SupportedIdDocTypes;
  countryCode: CountryCode;
};

export type SubmitDocTypeResponse = {
  id: string;
};
