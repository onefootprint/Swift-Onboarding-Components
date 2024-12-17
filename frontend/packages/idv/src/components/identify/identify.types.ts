import type { DeviceInfo } from '@/idv/hooks';
import type { DIMetadata } from '@/idv/types';
import type { ChallengeKind, ObConfigAuth, OverallOutcome, PublicOnboardingConfig } from '@onefootprint/types';
import type { IdentifyBootstrapData, LogoConfig } from './components/identify-login/state/types';
import type { State } from './utils/reducer';

export type InitArgs = {
  initialAuthToken?: string;
  isComponentsSdk?: boolean;
  bootstrapData?: IdentifyBootstrapData;
  config?: PublicOnboardingConfig;
  isLive: boolean;
  device: DeviceInfo;
  obConfigAuth?: ObConfigAuth;
  sandboxId?: string;
  overallOutcome?: OverallOutcome;
  logoConfig?: LogoConfig; // When provided, will render the logo
  variant: IdentifyVariant;
};

export enum IdentifyVariant {
  auth = 'auth',
  updateLoginMethods = 'updateLoginMethods',
  verify = 'verify',
}

export type DoneArgs = {
  authToken: string;
  phoneNumber?: DIMetadata<string>;
  email?: DIMetadata<string>;
  availableChallengeKinds?: ChallengeKind[];
};

export type Context = {
  state: State;
  initArgs: Omit<InitArgs, 'bootstrapData'>;
  onPrev?: () => void;
};

export type ObKeyHeader = { 'X-Onboarding-Config-Key': string };
