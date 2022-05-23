import type { Color } from 'styled';

export type IconProps = {
  color?: Color;
  className?: string;
  testID?: string;
};

export type Icon = (props: IconProps) => JSX.Element;
