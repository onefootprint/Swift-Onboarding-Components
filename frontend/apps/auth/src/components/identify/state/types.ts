import type { DeviceInfo } from '@onefootprint/idv';
import type {
  ChallengeData,
  ChallengeKind,
  IdentifyBootstrapData,
  ObConfigAuth,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import type { IdentifiedUser } from '@onefootprint/types/src/api/identify';

import type { EmailAndOrPhone } from '@/src/types';

export type IdentifyMachineContext = {
  authToken?: string;
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
  user?: IdentifiedUser;
  successfulIdentifier?: EmailAndOrPhone;
  sandboxId?: string;
  email?: string;
  phoneNumber?: string;
};

export type MachineChallengeContext = {
  authToken?: string;
  challengeData?: ChallengeData;
};

export type IdentifiedEvent = {
  type: 'identified';
  payload: IdentifyResult;
};

export type IdentifyMachineEvents =
  | IdentifiedEvent
  | { type: 'goToChallenge'; payload: ChallengeKind }
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
