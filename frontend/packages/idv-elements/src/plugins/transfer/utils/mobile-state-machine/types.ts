import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';

export type MachineContext = {
  device: DeviceInfo;
  authToken: string;
  scopedAuthToken: string;
  tab?: Window;
  config?: OnboardingConfig;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        device: DeviceInfo;
        authToken: string;
      };
    }
  | {
      type: 'scopedAuthTokenGenerated';
      payload: {
        scopedAuthToken: string;
      };
    }
  | { type: 'statusPollingErrored' }
  | {
      type: 'newTabOpened';
      payload: {
        tab: Window;
      };
    }
  | { type: 'newTabRegisterFailed' }
  | { type: 'livenessSkipped' }
  | { type: 'newTabRegisterSucceeded' }
  | { type: 'newTabRegisterCanceled' };
