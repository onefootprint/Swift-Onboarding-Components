import type { Theme } from '@onefootprint/design-tokens';
import type * as CSS from 'csstype';
import type { AriaRole } from 'react';

import type { SXStyleProps, SXStyles } from '../../hooks';

type BoxTag = 'div' | 'section' | 'article' | 'aside' | 'span' | 'main';

export type BoxPropsStyles = {
  sx?: SXStyles;
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
  gap?: keyof Theme['spacing'];
  elevation?: keyof Theme['elevation'];
};

export type BoxProps = BoxPropsStyles & {
  'aria-busy'?: boolean;
  ariaLabel?: string;
  as?: BoxTag;
  children?: React.ReactNode;
  id?: string;
  role?: AriaRole;
  sx?: SXStyleProps;
  testID?: string;
  className?: string;
};
