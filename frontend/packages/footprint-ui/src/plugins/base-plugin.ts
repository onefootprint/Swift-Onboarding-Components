import { DeviceInfo } from 'hooks';
import { CollectedDataOption } from 'types';

// TODO: Consolidate this type with use-tenant-info type & move to types package.
// Also rename to onboardingConfig
export type TenantInfo = {
  canAccessData: CollectedDataOption[];
  isLive: boolean;
  mustCollectData: CollectedDataOption[];
  name: string;
  orgName: string;
};

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
