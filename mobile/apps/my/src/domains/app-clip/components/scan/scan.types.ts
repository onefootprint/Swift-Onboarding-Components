import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type Navigation = {
  DocSelection: undefined;
  DriversLicense: undefined;
};

export type ScreenProps<T extends keyof Navigation> = NativeStackScreenProps<
  Navigation,
  T
>;

export type NavigationProps = NativeStackScreenProps<Navigation>;
