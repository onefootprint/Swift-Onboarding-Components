import { DeviceInfo } from 'hooks';
import { TenantInfo } from 'types';

export type PluginContext<T> = {
  authToken: string;
  tenantInfo: TenantInfo;
  deviceInfo: DeviceInfo;
  customData: T;
};

export type BasePluginProps<T> = {
  context: PluginContext<T>;
  customMetadata: any;
  onDone: () => void;
};
