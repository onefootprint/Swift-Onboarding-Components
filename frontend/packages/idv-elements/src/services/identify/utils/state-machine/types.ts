import {
  ChallengeKind,
  Identifier,
  IdentifyBootstrapData,
  ObConfigAuth,
  OnboardingConfig,
} from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';

export type MachineContext = {
  bootstrapData: IdentifyBootstrapData;
  obConfigAuth: ObConfigAuth;
  config?: OnboardingConfig;
  device?: DeviceInfo;
  identify: MachineIdentifyContext;
  challenge: MachineChallengeContext;
  showLogo?: boolean;
};

export type MachineIdentifyContext = {
  phoneNumber?: string;
  email?: string;
  userFound?: boolean;
  successfulIdentifier?: Identifier;
  sandboxId?: string;
};

export type MachineChallengeContext = {
  hasSyncablePassKey?: boolean;
  availableChallengeKinds?: ChallengeKind[];
  authToken?: string;
};

export type MachineEvents =
  | {
      type: 'configRequestFailed';
    }
  | {
      type: 'initContextUpdated';
      payload: {
        config?: OnboardingConfig;
        device?: DeviceInfo;
      };
    }
  | {
      type: 'sandboxOutcomeSubmitted';
      payload: {
        sandboxId: string;
      };
    }
  | {
      type: 'bootstrapDataInvalid';
    }
  | {
      type: 'identified';
      payload: {
        email?: string;
        phoneNumber?: string;
        successfulIdentifier?: Identifier;
        userFound: boolean;
        availableChallengeKinds?: ChallengeKind[];
        hasSyncablePassKey?: boolean;
      };
    }
  | {
      type: 'identifyFailed';
      payload: {
        email?: string;
        phoneNumber?: string;
      };
    }
  | { type: 'identifyReset' }
  | {
      type: 'challengeSucceeded';
      payload: {
        authToken: string;
      };
    }
  | { type: 'changeChallengeToSms' }
  | { type: 'navigatedToPrevPage' };
