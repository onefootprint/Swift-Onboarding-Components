import type { CountryCode, CountryCode3, IdDocOutcome, SupportedIdDocTypes } from '../data';

export type SubmitDocTypeRequest = {
  authToken: string;
  countryCode: CountryCode | CountryCode3;
  documentType: SupportedIdDocTypes;
  fixtureResult?: IdDocOutcome;
  requestId: string;
};

export type SubmitDocTypeResponse = {
  errors: string[];
  id: string;
};
