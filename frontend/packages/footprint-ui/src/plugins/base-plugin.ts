import { DeviceInfo } from 'hooks';
import { TenantInfo } from 'types';

export type PluginContext<T> = {
  authToken: string;
  customData?: T;
  device: DeviceInfo;
  tenantInfo?: TenantInfo;
};

export type BasePluginProps<T = void> = {
  context: PluginContext<T>;
  metadata: any;
  onDone: () => void;
};
