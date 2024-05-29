import type { Spacing, Theme } from '@onefootprint/design-tokens';
import type * as CSS from 'csstype';
import type { AriaRole } from 'react';

import type { SXStyleProps, SXStyles } from '../../hooks';

export type GridTag =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'span'
  | 'main'
  | 'form'
  | 'ul'
  | 'li'
  | 'ol'
  | 'nav'
  | 'header'
  | 'footer'
  | 'button'
  | 'input'
  | 'select'
  | 'textarea'
  | 'label'
  | 'fieldset'
  | 'legend'
  | 'table'
  | 'caption'
  | 'tbody'
  | 'thead'
  | 'tfoot'
  | 'tr'
  | 'td'
  | 'th'
  | 'img';

export type GridStylesProps = {
  sx?: SXStyles;
  columns?: string[];
  rows?: string[];
  columnGap?: Spacing;
  rowGap?: Spacing;
  gap?: Spacing;
  templateAreas?: string[];
  alignItems?: CSS.Property.AlignItems;
  justifyContent?: CSS.Property.JustifyContent;
  backgroundColor?: keyof Theme['backgroundColor'];
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
};

export type ItemProps = {
  gridArea?: string;
  column?: string;
  row?: string;
};

export type GridContainerProps = GridStylesProps & {
  'aria-busy'?: boolean;
  ariaLabel?: string;
  as?: GridTag;
  children?: React.ReactNode;
  id?: string;
  role?: AriaRole;
  sx?: SXStyleProps;
  testID?: string;
  className?: string;
};
