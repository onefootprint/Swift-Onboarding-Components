import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';

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
