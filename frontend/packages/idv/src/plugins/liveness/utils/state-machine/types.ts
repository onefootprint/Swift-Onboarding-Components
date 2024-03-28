import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';

export type MachineContext = {
  device: DeviceInfo;
  authToken: string;
  isInIframe: boolean;
};

export type MachineEvents =
  | { type: 'skipped' }
  | { type: 'succeeded' }
  | { type: 'completed' };
