import type { VaultValue } from '@onefootprint/types';

import type { FormValues } from '../../types';

export const ALLOW_EXTRA_FIELDS_HEADER = 'x-fp-allow-extra-fields';

export type SaveDataError = {
  error: {
    message: Partial<Record<keyof FormValues, string>> | string;
  };
};

export type SaveDataRequest = {
  data: Partial<Record<keyof FormValues, VaultValue>>;
  bootstrapDis: FormValues[];
  authToken: string;
  allowExtraFields?: boolean;
  speculative?: boolean;
};

export type SaveDataResponse = { data: string };
