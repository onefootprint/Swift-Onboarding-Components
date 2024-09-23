import type { FootprintAuthDataProps } from '@onefootprint/footprint-js';
import type { DeviceInfo } from '@onefootprint/idv';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import type { NotificationProps } from '../../notification';
import type { Typegen0 } from './machine.typegen';

export type AuthDataPropsWithToken = FootprintAuthDataProps & { authToken?: string };

export type AuthIdentifyAppMachineArgs = {};
export type AuthIdentifyAppMachineState = Typegen0['matchesStates'];

export type AuthIdentifyAppMachineContext = {
  authToken?: string;
  config?: PublicOnboardingConfig;
  device?: DeviceInfo;
  isPasskeyAlreadyRegistered?: boolean;
  notification?: NotificationProps;
  passkeyRegistrationWindow?: Window;
  props?: AuthDataPropsWithToken;
  scopedAuthToken?: string;
  validationToken?: string;
};

export type AuthIdentifyAppMachineEvents =
  | {
      type: 'initPropsReceived';
      payload: {
        config: PublicOnboardingConfig;
        device: DeviceInfo;
        props: AuthDataPropsWithToken;
      };
    }
  | { type: 'identifyCompleted'; payload: { authToken: string; isPasskeyAlreadyRegistered: boolean } }
  | { type: 'invalidAuthConfigReceived' }
  | { type: 'invalidConfigReceived' }
  | { type: 'onboardingValidationCompleted'; payload: { validationToken: string } }
  | { type: 'onboardingValidationError'; payload: unknown }
  | { type: 'passkeyProcessingCancelled'; payload?: never }
  | { type: 'passkeyProcessingCompleted' }
  | { type: 'passkeyProcessingError' }
  | { type: 'passkeyRegistrationError'; payload: unknown }
  | { type: 'passkeyRegistrationSkip' }
  | { type: 'passkeyRegistrationTabOpened'; payload: Window }
  | { type: 'scopedAuthTokenReceived'; payload: string }
  | { type: 'sdkUrlNotAllowedReceived' };
