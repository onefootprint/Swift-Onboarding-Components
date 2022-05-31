import type { Color } from 'styled';

export type IconProps = {
  color?: Color;
  className?: string;
  testID?: string;
};

export type Icon = (props: IconProps) => JSX.Element;

export type FlagProps = {
  className?: string;
  testID?: string;
};

export type Flag = (props: FlagProps) => JSX.Element;
