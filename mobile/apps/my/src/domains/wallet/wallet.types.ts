import { Identifier } from '@onefootprint/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type Navigation = {
  DeviceSignals: undefined;
  EmailIdentification: undefined;
  Login: {
    canUseBiometric: boolean;
    identifier: Identifier;
  };
  MainTabs: undefined;
  Vault: undefined;
  VaultStack: undefined;
  Sharing: undefined;
  SharingStack: undefined;
  Settings: undefined;
};

export type ScreenProps<T extends keyof Navigation> = NativeStackScreenProps<
  Navigation,
  T
>;
