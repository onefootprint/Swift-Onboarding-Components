import type { Color } from '@onefootprint/design-tokens';

export type IconProps = {
  color?: Color;
  style?: Record<string, unknown>;
  testID?: string;
};

export type Icon = (props: IconProps) => JSX.Element;

export type FlagProps = {
  style?: Record<string, unknown>;
  testID?: string;
};

export type Flag = (props: FlagProps) => JSX.Element;
