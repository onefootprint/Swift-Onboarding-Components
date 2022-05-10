import { Properties } from 'csstype';
import type { Color } from 'styled';

export type IconProps = {
  color?: Color;
  style?: Properties;
  testID?: string;
};

export type Icon = (props: IconProps) => JSX.Element;
