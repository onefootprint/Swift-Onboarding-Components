import type { Color } from '@onefootprint/design-tokens';

export type IconProps = {
  color?: Color;
  style?: any;
  testID?: string;
};

export type Icon = (props: IconProps) => JSX.Element;

export type FlagProps = {
  style?: any;
  testID?: string;
};

export type Flag = (props: FlagProps) => JSX.Element;
