import { Properties } from 'csstype';
import type { Colors } from 'styled';

export type IconProps = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

export type Icon = (props: IconProps) => JSX.Element;
