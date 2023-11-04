import type {
  CountryCode,
  CountryCode3,
  IdDocOutcomes,
  SupportedIdDocTypes,
} from '../data';

export type SubmitDocTypeRequest = {
  authToken: string;
  countryCode: CountryCode | CountryCode3;
  documentType: SupportedIdDocTypes;
  fixtureResult?: IdDocOutcomes;
};

export type SubmitDocTypeResponse = {
  errors: string[];
  id: string;
};
