import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type Navigation = {
  Login: undefined;
  PhoneIdentification: undefined;
  MainTabs: undefined;
  Vault: undefined;
  VaultStack: undefined;
  Sharing: undefined;
  SharingStack: undefined;
};

export type ScreenProps<T extends keyof Navigation> = NativeStackScreenProps<
  Navigation,
  T
>;
