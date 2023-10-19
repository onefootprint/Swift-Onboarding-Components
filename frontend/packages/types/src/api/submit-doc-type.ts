import type { CountryCode, IdDocOutcome, SupportedIdDocTypes } from '../data';

export type SubmitDocTypeRequest = {
  authToken: string;
  documentType: SupportedIdDocTypes;
  countryCode: CountryCode;
  fixtureResult?: IdDocOutcome;
  skipSelfie?: boolean;
  deviceType?: 'mobile' | 'desktop';
};

export type SubmitDocTypeResponse = {
  id: string;
};
