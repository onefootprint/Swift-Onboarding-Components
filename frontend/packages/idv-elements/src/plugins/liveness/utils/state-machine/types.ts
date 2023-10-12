import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';

export type MachineContext = {
  device?: DeviceInfo;
  authToken?: string;
  isTransfer?: boolean;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        isTransfer?: boolean;
        authToken: string;
        device: DeviceInfo;
      };
    }
  | { type: 'failed' }
  | { type: 'skipped' }
  | { type: 'succeeded' }
  | { type: 'completed' };
