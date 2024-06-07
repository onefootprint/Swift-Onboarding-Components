import type {
  AuthMethodKind,
  ChallengeData,
  ChallengeKind,
  ObConfigAuth,
  OverallOutcome,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import type { IdentifiedUser } from '@onefootprint/types/src/api/identify';
import type { EventObject, StateValue, TransitionConfigOrTarget } from 'xstate';

import type { DeviceInfo } from '../../../hooks';
import type { UserDatum } from '../../../types';

export type IdentifyMachineContext = {
  bootstrapData: IdentifyBootstrapData;
  isComponentsSdk: boolean;
  challenge: MachineChallengeContext;
  /** config -
   * The identify flow may have no config if we're logging into a non-onboarding flow, like
   * "update login methods."
   */
  config?: PublicOnboardingConfig;
  device: DeviceInfo;
  sandboxId?: string;
  /** phoneNumber -
   * The phone number entered into the identify flow */
  phoneNumber?: UserDatum<string>;
  /** email -
   * The email entered into the identify flow */
  email?: UserDatum<string>;
  identify: IdentifyContext;
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

export type IdentifyBootstrapData = {
  email?: string;
  phoneNumber?: string;
};

export type IdentifyContext = {
  user?: IdentifiedUser;
  successfulIdentifiers?: SuccessfulIdentifier[];
  identifyToken?: string;
};

export enum SuccessfulIdentifier {
  phone = 'phone',
  email = 'email',
  authToken = 'authToken',
}

export type TransitionsFor<EVENT extends EventObject> = TransitionConfigOrTarget<
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

export type IdentifiedEventPayload = {
  user?: IdentifiedUser;
  successfulIdentifiers?: SuccessfulIdentifier[];
  phoneNumber?: string;
  email?: string;
};

export type IdentifiedEvent = {
  // Very annoying... unit tests are running init bootstrap data twice
  type: 'identifyResult' | 'bootstrapReceived';
  payload: IdentifiedEventPayload;
};

export type IdentifyMachineEvents =
  | ChallengeSucceededEvent
  | IdentifiedEvent
  | NavigatedToPrevPage
  | { type: 'authTokenInvalid' }
  | { type: 'loginWithDifferentAccount' }
  | { type: 'bootstrapDataInvalid' }
  | { type: 'challengeReceived'; payload: ChallengeData }
  | { type: 'goToChallenge'; payload: ChallengeKind }
  | { type: 'identifiedWithSufficientScopes'; payload: { authToken: string } }
  | { type: 'kbaSucceeded'; payload: { identifyToken: string } }
  | { type: 'phoneAdded'; payload: { phoneNumber: string } }
  | { type: 'sandboxIdChanged'; payload: { sandboxId: string } }
  | { type: 'tryAnotherWay'; payload: ChallengeKind };
