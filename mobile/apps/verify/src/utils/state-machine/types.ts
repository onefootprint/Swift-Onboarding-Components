import type { PublicOnboardingConfig } from '@onefootprint/types';

export type MachineContext = {
  authToken: string;
  config?: PublicOnboardingConfig;
};

export type MachineEvents =
  | { type: 'failed' }
  | { type: 'done' }
  | {
      type: 'sdkArgsReceived';
      payload: {
        config: PublicOnboardingConfig;
      };
    };
