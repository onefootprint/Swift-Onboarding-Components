import { DeviceInfo } from '@onefootprint/hooks';
import {
  ChallengeKind,
  Identifier,
  ObConfigAuth,
  OnboardingConfig,
} from '@onefootprint/types';

export type BootstrapData = {
  email?: string;
  phoneNumber?: string;
};

export type MachineContext = {
  bootstrapData: BootstrapData;
  obConfigAuth: ObConfigAuth;
  config?: OnboardingConfig;
  device?: DeviceInfo;
  identify: MachineIdentifyContext;
  challenge: MachineChallengeContext;
};

export type MachineIdentifyContext = {
  phoneNumber?: string;
  email?: string;
  userFound?: boolean;
  successfulIdentifier?: Identifier;
  sandboxSuffix?: string;
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
        sandboxSuffix: string;
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
  | { type: 'challengeFailed' }
  | { type: 'navigatedToPrevPage' };
