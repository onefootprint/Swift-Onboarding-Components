import type { DeviceInfo } from '@onefootprint/idv-elements';
import type {
  ChallengeData,
  ChallengeKind,
  IdentifyBootstrapData,
  ObConfigAuth,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { EmailAndOrPhone } from '../types';

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
  successfulIdentifier?: EmailAndOrPhone;
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
    successfulIdentifier?: EmailAndOrPhone;
    userFound: boolean;
    isUnverified: boolean;
    availableChallengeKinds?: ChallengeKind[];
    hasSyncablePassKey?: boolean;
  };
};

export type MachineEvents =
  | IdentifiedEvent
  | { type: 'authTokenInvalid' }
  | { type: 'bootstrapDataInvalid' }
  | { type: 'challengeReceived'; payload: ChallengeData }
  | { type: 'challengeSucceeded'; payload: { authToken: string } }
  | { type: 'changeChallengeToSms' }
  | { type: 'hasSufficientScopes'; payload: { authToken: string } }
  | { type: 'identifyFailed'; payload: EmailAndOrPhone }
  | { type: 'identifyReset' }
  | { type: 'navigatedToPrevPage' }
  | { type: 'sandboxIdChanged'; payload: { sandboxId: string } };
