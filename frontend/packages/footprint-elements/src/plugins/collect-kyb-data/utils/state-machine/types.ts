import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';

export type MachineContext = {
  device?: DeviceInfo;
  authToken?: string;
  config?: OnboardingConfig;
};

export type MachineEvents = {
  type: 'receivedContext';
  payload: {
    authToken: string;
    device: DeviceInfo;
    config: OnboardingConfig;
  };
};
