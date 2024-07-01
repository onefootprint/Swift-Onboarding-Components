import type { VaultValue } from '@onefootprint/types';

import type { Di } from './dis';

export const ALLOW_EXTRA_FIELDS_HEADER = 'x-fp-allow-extra-fields';

export type SaveDataError = {
  error: {
    message: Partial<Record<keyof Di, string>> | string;
  };
};

export type SaveDataRequest = {
  data: Partial<Record<keyof Di, VaultValue>>;
  bootstrapDis: Di[];
  authToken: string;
  allowExtraFields?: boolean;
  speculative?: boolean;
};

export type SaveDataResponse = { data: string };
