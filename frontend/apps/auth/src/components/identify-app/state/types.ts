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
  notification?: NotificationProps;
  passkeyRegistrationWindow?: Window;
  props?: AuthDataPropsWithToken;
  scopedAuthToken?: string;
};

export type AuthIdentifyAppMachineEvents =
  | { type: 'authPropsReceived'; payload: { props?: AuthDataPropsWithToken; config?: PublicOnboardingConfig } }
  | { type: 'deviceReceived'; payload: DeviceInfo }
  | { type: 'identifyCompleted'; payload: { authToken: string } }
  | { type: 'identifyCompletedPasskeyAlreadyRegistered' }
  | { type: 'invalidAuthConfigReceived' }
  | { type: 'invalidConfigReceived' }
  | { type: 'notificationReceived'; payload: NotificationProps }
  | { type: 'passkeyProcessingCancelled'; payload?: never }
  | { type: 'passkeyProcessingCompleted' }
  | { type: 'passkeyProcessingError' }
  | { type: 'passkeyRegistrationError'; payload: unknown }
  | { type: 'passkeyRegistrationTabOpened'; payload: Window }
  | { type: 'scopedAuthTokenReceived'; payload: string }
  | { type: 'sdkUrlNotAllowedReceived' };
