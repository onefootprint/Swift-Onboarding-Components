import type {
  ChallengeData,
  ChallengeKind,
  Identifier,
  IdentifyBootstrapData,
  ObConfigAuth,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import type { IdentifiedUser } from '@onefootprint/types/src/api/identify';

import type { DeviceInfo } from '../../../hooks';
import type { EmailAndOrPhone } from '../types';

export type IdentifyMachineContext = {
  /// Optionally, the identified token used to start the flow
  initialAuthToken?: string;
  /// The autheticated token we yield at the end of the flow
  authToken?: string;
  bootstrapData: IdentifyBootstrapData;
  challenge: MachineChallengeContext;
  /// The identify flow may have no config if we're logging into a non-onboarding flow, like
  /// "update login methods."
  config?: PublicOnboardingConfig;
  /// Use isLive - config isn't always provided
  isLive: boolean;
  device: DeviceInfo;
  identify: IdentifyResult;
  obConfigAuth?: ObConfigAuth;
  overallOutcome?: OverallOutcome;
  logoConfig?: LogoConfig;
  variant: IdentifyVariant;
};

export enum IdentifyVariant {
  updateLoginMethods,
  auth,
}

export type LogoConfig = {
  orgName: string;
  logoUrl?: string;
};

export type IdentifyResult = {
  user?: IdentifiedUser;
  successfulIdentifier?: Identifier;
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
