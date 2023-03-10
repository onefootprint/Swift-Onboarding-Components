import { DeviceInfo } from '@onefootprint/hooks';
import {
  ChallengeKind,
  Identifier,
  OnboardingConfig,
} from '@onefootprint/types';

import { BootstrapData } from '../bifrost/types';

export type MachineContext = {
  config?: OnboardingConfig;
  device: DeviceInfo;
  bootstrapData: BootstrapData;
  identify: MachineIdentifyContext;
  challenge: MachineChallengeContext;
};

export type MachineIdentifyContext = {
  phoneNumber?: string;
  email?: string;
  userFound?: boolean;
  successfulIdentifier?: Identifier;
  identifierSuffix?: string;
};

export type MachineChallengeContext = {
  hasSyncablePassKey?: boolean;
  availableChallengeKinds?: ChallengeKind[];
  authToken?: string;
};

export type MachineEvents =
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
