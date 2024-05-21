import type { FootprintUserData } from '@onefootprint/footprint-js';

export type UserDataError = {
  error: {
    message: Partial<Record<keyof FootprintUserData, string>> | string;
  };
};
