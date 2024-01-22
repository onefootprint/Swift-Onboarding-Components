import type { Spacing, Theme } from '@onefootprint/design-tokens';
import type * as CSS from 'csstype';
import type { HTMLMotionProps } from 'framer-motion';
import type { AriaRole } from 'react';

export type AsTagProps = {
  as?: string | HTMLMotionProps<'div'>;
};

export type StackStylesProps = {
  backgroundColor?: keyof Theme['backgroundColor'];
  surfaceColor?: keyof Theme['surfaceColor'];
  borderColor?: keyof Theme['borderColor'];
  borderRadius?: keyof Theme['borderRadius'];
  borderWidth?: keyof Theme['borderWidth'];
  borderPosition?: 'top' | 'right' | 'bottom' | 'left' | 'all';
  overflow?: CSS.Property.Overflow;
  position?: CSS.Property.Position;
  display?: CSS.Property.Display;
  flexDirection?: CSS.Property.FlexDirection;
  visibility?: CSS.Property.Visibility;
  textAlign?: CSS.Property.TextAlign;
  fontStyle?: keyof Theme['typography'];
  height?: string;
  width?: string;
  padding?: keyof Theme['spacing'];
  paddingLeft?: keyof Theme['spacing'];
  paddingRight?: keyof Theme['spacing'];
  paddingTop?: keyof Theme['spacing'];
  paddingBottom?: keyof Theme['spacing'];
  marginTop?: keyof Theme['spacing'];
  marginBottom?: keyof Theme['spacing'];
  marginLeft?: keyof Theme['spacing'];
  marginRight?: keyof Theme['spacing'];
  margin?: keyof Theme['spacing'];
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  elevation?: keyof Theme['elevation'];
  top?: keyof Theme['spacing'];
  left?: keyof Theme['spacing'];
  right?: keyof Theme['spacing'];
  bottom?: keyof Theme['spacing'];
  zIndex?: keyof Theme['zIndex'];
  gap?: Spacing;
  flexWrap?: CSS.Property.FlexWrap;
  direction?: CSS.Property.FlexDirection;
  align?: CSS.Property.AlignItems;
  justify?: CSS.Property.JustifyContent;
  flexGrow?: CSS.Property.FlexGrow;
  inline?: boolean;
  textOverflow?: CSS.Property.TextOverflow;
  whiteSpace?: CSS.Property.WhiteSpace;
};

export type StackProps = StackStylesProps & {
  'aria-busy'?: boolean;
  ariaLabel?: string;
  as?: AsTagProps;
  children?: React.ReactNode;
  id?: string;
  role?: AriaRole;
  testID?: string;
  className?: string;
};
