import type {
  AuthMethodKind,
  ChallengeData,
  ChallengeKind,
  Identifier,
  IdentifyBootstrapData,
  ObConfigAuth,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import type { IdentifiedUser } from '@onefootprint/types/src/api/identify';
import type { EventObject, StateValue, TransitionConfigOrTarget } from 'xstate';

import type { DeviceInfo } from '../../../hooks';
import type { EmailAndOrPhone } from '../types';

export type IdentifyMachineContext = {
  bootstrapData: IdentifyBootstrapData;
  challenge: MachineChallengeContext;
  /** config -
   * The identify flow may have no config if we're logging into a non-onboarding flow, like
   * "update login methods."
   */
  config?: PublicOnboardingConfig;
  device: DeviceInfo;
  identify: IdentifyResult & { identifyToken?: string };
  /** initialAuthToken -
   * Optionally, the identified token used to start the flow
   * The authenticated token we yield at the end of the flow
   */
  initialAuthToken?: string;
  /** Use isLive - config isn't always provided */
  isLive: boolean;
  logoConfig?: LogoConfig;
  obConfigAuth?: ObConfigAuth;
  overallOutcome?: OverallOutcome;
  variant: IdentifyVariant;
};

export type TransitionsFor<EVENT extends EventObject> =
  TransitionConfigOrTarget<
    IdentifyMachineContext,
    EVENT,
    IdentifyMachineEvents
  >;

export enum IdentifyVariant {
  auth = 'auth',
  updateLoginMethods = 'updateLoginMethods',
  verify = 'verify',
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

export type NavigatedToPrevPage = {
  type: 'navigatedToPrevPage';
  payload?: { prev?: StateValue; curr?: StateValue };
};

export type ChallengeSucceededEvent = {
  type: 'challengeSucceeded';
  payload: { kind: AuthMethodKind; authToken: string };
};

export type IdentifiedEvent = { type: 'identified'; payload: IdentifyResult };

export type IdentifyMachineEvents =
  | ChallengeSucceededEvent
  | IdentifiedEvent
  | NavigatedToPrevPage
  | { type: 'authTokenInvalid' }
  | { type: 'bootstrapDataInvalid' }
  | { type: 'challengeReceived'; payload: ChallengeData }
  | { type: 'goToChallenge'; payload: ChallengeKind }
  | { type: 'identifiedWithSufficientScopes'; payload: { authToken: string } }
  | { type: 'identifyFailed'; payload: EmailAndOrPhone }
  | { type: 'identifyReset' }
  | { type: 'kbaSucceeded'; payload: { identifyToken: string } }
  | { type: 'phoneAdded'; payload: { phoneNumber: string } }
  | { type: 'sandboxIdChanged'; payload: { sandboxId: string } }
  | { type: 'tryAnotherWay'; payload: ChallengeKind };
