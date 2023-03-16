import { DeviceInfo } from '@onefootprint/hooks';

export type MachineContext = {
  // Plugin context
  device?: DeviceInfo;
  authToken?: string;
};

export type MachineEvents = {
  type: 'receivedContext';
  payload: {
    authToken: string;
    device: DeviceInfo;
  };
};
