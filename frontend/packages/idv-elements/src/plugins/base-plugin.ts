import { DeviceInfo } from '@onefootprint/hooks';

export type PluginContext<T> = {
  authToken: string;
  customData?: T;
  device: DeviceInfo;
};

export type BasePluginProps<T = void> = {
  context: PluginContext<T>;
  onDone: () => void;
};
