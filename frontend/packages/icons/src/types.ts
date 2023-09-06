import type { Color } from '@onefootprint/design-tokens';

export type Icon = (props: IconProps) => JSX.Element;
export type IconProps = {
  color?: Color;
  className?: string;
  testID?: string;
};
