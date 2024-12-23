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

import type { DeviceInfo } from '../../../../../hooks';
import type { DIMetadata } from '../../../../../types';

export enum IdentifyVariant {
  auth = 'auth',
  updateLoginMethods = 'updateLoginMethods',
  verify = 'verify',
}

export type IdentifyBootstrapData = { email?: string; phoneNumber?: string };

export type LogoConfig = { orgName: string; logoUrl?: string };

export type MachineChallengeContext = { authToken?: string; challengeData?: ChallengeData };

export type IdentifyMachineArgs = {
  identify: IdentifyContext;
  isComponentsSdk?: boolean;
  bootstrapData?: IdentifyBootstrapData;
  config?: PublicOnboardingConfig;
  isLive: boolean;
  device: DeviceInfo;
  obConfigAuth?: ObConfigAuth;
  overallOutcome?: OverallOutcome;
  logoConfig?: LogoConfig; // When provided, will render the logo
  variant: IdentifyVariant;
};

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
  phoneNumber?: DIMetadata<string>;
  /** email -
   * The email entered into the identify flow */
  email?: DIMetadata<string>;
  identify: IdentifyContext;
  /** Use isLive - config isn't always provided */
  isLive: boolean;
  logoConfig?: LogoConfig;
  obConfigAuth?: ObConfigAuth;
  overallOutcome?: OverallOutcome;
  variant: IdentifyVariant;
};

export type IdentifyContext = {
  user: IdentifiedUser;
  identifyToken: string;
};

export type TransitionsFor<EVENT extends EventObject> = TransitionConfigOrTarget<
  IdentifyMachineContext,
  EVENT,
  IdentifyMachineEvents
>;

export type NavigatedToPrevPage = {
  type: 'navigatedToPrevPage';
  payload?: { prev?: StateValue; curr?: StateValue };
};

export type ChallengeSucceededEvent = {
  type: 'challengeSucceeded';
  payload: { kind: AuthMethodKind; authToken: string };
};

export type IdentifyMachineEvents =
  | ChallengeSucceededEvent
  | NavigatedToPrevPage
  | { type: 'challengeReceived'; payload: ChallengeData }
  | { type: 'emailAdded'; payload: string }
  | { type: 'goToChallenge'; payload: ChallengeKind }
  | { type: 'kbaSucceeded'; payload: { identifyToken: string } }
  | { type: 'phoneAdded'; payload: string }
  | { type: 'tryAnotherWay'; payload: ChallengeKind };
