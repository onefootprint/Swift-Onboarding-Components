import type { DeviceInfo } from '../hooks/ui/use-device-info';

export type PluginContext<T> = {
  authToken: string;
  customData?: T;
  device: DeviceInfo;
};

export type BasePluginProps<T = void> = {
  context: PluginContext<T>;
  onDone: () => void;
};
