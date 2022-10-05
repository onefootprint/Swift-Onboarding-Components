import { DeviceInfo } from '@onefootprint/hooks';
import { TenantInfo } from '@onefootprint/types';

export type PluginContext<T> = {
  authToken: string;
  customData?: T;
  device: DeviceInfo;
  tenant: TenantInfo;
};

export type BasePluginProps<T = void> = {
  context: PluginContext<T>;
  metadata: any;
  onDone: () => void;
};
