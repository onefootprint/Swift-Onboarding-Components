import { FootprintBootstrapData } from '@onefootprint/footprint-js';

export type UserDataError = {
  context: Partial<Record<keyof FootprintBootstrapData, string>> | string;
};
