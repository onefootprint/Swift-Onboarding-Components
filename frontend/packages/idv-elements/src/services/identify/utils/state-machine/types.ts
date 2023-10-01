import type {
  ChallengeKind,
  IdDocOutcomes,
  Identifier,
  IdentifyBootstrapData,
  ObConfigAuth,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';

export type MachineContext = {
  config: PublicOnboardingConfig;
  device: DeviceInfo;
  bootstrapData: IdentifyBootstrapData;
  obConfigAuth?: ObConfigAuth;
  identify: IdentifyResult;
  challenge: MachineChallengeContext;
  showLogo?: boolean;
  idDocOutcome?: IdDocOutcomes;
  initialAuthToken?: string;
};

export type IdentifyResult = {
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
      type: 'bootstrapDataInvalid';
    }
  | {
      type: 'hasSufficientScopes';
      payload: {
        authToken: string;
      };
    }
  | {
      type: 'authTokenInvalid';
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
