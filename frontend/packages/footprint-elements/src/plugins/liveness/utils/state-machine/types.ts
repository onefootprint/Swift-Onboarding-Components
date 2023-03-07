import { DeviceInfo } from '@onefootprint/hooks';

export type MachineContext = {
  device?: DeviceInfo;
  authToken?: string;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        authToken: string;
        device: DeviceInfo;
      };
    }
  | { type: 'failed' }
  | { type: 'skipped' }
  | { type: 'succeeded' }
  | { type: 'completed' };
