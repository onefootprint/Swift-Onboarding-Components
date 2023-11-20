import type { DeviceInfo } from '@onefootprint/idv-elements';
import type {
  ChallengeData,
  ChallengeKind,
  Identifier,
  IdentifyBootstrapData,
  ObConfigAuth,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';

export type MachineContext = {
  bootstrapData: IdentifyBootstrapData;
  challenge: MachineChallengeContext;
  config: PublicOnboardingConfig;
  device: DeviceInfo;
  identify: IdentifyResult;
  obConfigAuth?: ObConfigAuth;
  overallOutcome?: OverallOutcome;
  showLogo?: boolean;
};

export type IdentifyResult = {
  email?: string;
  isUnverified?: boolean;
  phoneNumber?: string;
  sandboxId?: string;
  successfulIdentifier?: Identifier;
  userFound?: boolean;
};

export type MachineChallengeContext = {
  authToken?: string;
  availableChallengeKinds?: ChallengeKind[];
  challengeData?: ChallengeData;
  hasSyncablePassKey?: boolean;
};

export type IdentifiedEvent = {
  type: 'identified';
  payload: {
    email?: string;
    phoneNumber?: string;
    successfulIdentifier?: Identifier;
    userFound: boolean;
    isUnverified: boolean;
    availableChallengeKinds?: ChallengeKind[];
    hasSyncablePassKey?: boolean;
  };
};

export type MachineEvents =
  | { type: 'bootstrapDataInvalid' }
  | {
      type: 'hasSufficientScopes';
      payload: { authToken: string };
    }
  | { type: 'authTokenInvalid' }
  | IdentifiedEvent
  | {
      type: 'identifyFailed';
      payload: {
        email?: string;
        phoneNumber?: string;
      };
    }
  | { type: 'identifyReset' }
  | {
      type: 'challengeReceived';
      payload: ChallengeData;
    }
  | {
      type: 'challengeSucceeded';
      payload: { authToken: string };
    }
  | {
      type: 'sandboxIdChanged';
      payload: { sandboxId: string };
    }
  | { type: 'changeChallengeToSms' }
  | { type: 'navigatedToPrevPage' };
