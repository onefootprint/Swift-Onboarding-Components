import type {
  CountryCode,
  DocumentRequestKind,
  IdDocOutcome,
  SupportedIdDocTypes,
} from '../data';

export type SubmitDocTypeRequest = {
  authToken: string;
  documentType: SupportedIdDocTypes | DocumentRequestKind;
  requestId: string;
  fixtureResult?: IdDocOutcome;
  countryCode?: CountryCode;
  skipSelfie?: boolean;
  deviceType?: 'mobile' | 'desktop';
};

export type SubmitDocTypeResponse = {
  id: string;
};
