import { CountryCode, IdDocOutcomes, SupportedIdDocTypes } from '../data';

export type SubmitDocTypeRequest = {
  authToken: string;
  documentType: SupportedIdDocTypes;
  countryCode: CountryCode;
  fixtureResult?: IdDocOutcomes;
};

export type SubmitDocTypeResponse = {
  id: string;
};
