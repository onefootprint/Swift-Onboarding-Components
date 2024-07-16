import type { BackgroundColor, BorderColor, BorderRadius, Elevation, Spacing } from '@onefootprint/design-tokens';
import type { FlexStyle, TransformsStyle, ViewProps } from 'react-native';

export type BoxStyleProps = Omit<
  FlexStyle,
  | 'margin'
  | 'padding'
  | 'backgroundColor'
  | 'borderBottomColor'
  | 'borderColor'
  | 'borderEndColor'
  | 'borderLeftColor'
  | 'borderRightColor'
  | 'borderStartColor'
  | 'borderTopColor'
  | 'borderBottomEndRadius'
  | 'borderBottomLeftRadius'
  | 'borderBottomRightRadius'
  | 'borderBottomStartRadius'
  | 'borderRadius'
  | 'borderTopEndRadius'
  | 'borderTopLeftRadius'
  | 'borderTopRightRadius'
  | 'borderTopStartRadius'
> & {
  gap?: Spacing;
  rowGap?: Spacing;
  columnGap?: Spacing;
  elevation?: Elevation;
  margin?: Spacing;
  marginBottom?: Spacing;
  marginEnd?: Spacing;
  marginHorizontal?: Spacing;
  marginLeft?: Spacing;
  marginRight?: Spacing;
  marginStart?: Spacing;
  marginTop?: Spacing;
  marginVertical?: Spacing;
  padding?: Spacing;
  paddingBottom?: Spacing;
  paddingEnd?: Spacing;
  paddingHorizontal?: Spacing;
  paddingLeft?: Spacing;
  paddingRight?: Spacing;
  paddingStart?: Spacing;
  paddingTop?: Spacing;
  paddingVertical?: Spacing;
  backgroundColor?: BackgroundColor;
  borderBottomColor?: BorderColor;
  borderRadius?: BorderRadius;
  borderBottomEndRadius?: BorderRadius;
  borderBottomLeftRadius?: BorderRadius;
  borderBottomRightRadius?: BorderRadius;
  borderBottomStartRadius?: BorderRadius;
  borderColor?: BorderColor;
  borderEndColor?: BorderColor;
  borderLeftColor?: BorderColor;
  borderRightColor?: BorderColor;
  borderStartColor?: BorderColor;
  borderTopColor?: BorderColor;
  borderTopEndRadius?: BorderRadius;
  borderTopLeftRadius?: BorderRadius;
  borderTopRightRadius?: BorderRadius;
  borderTopStartRadius?: BorderRadius;
} & TransformsStyle;

export type BoxProps = ViewProps &
  BoxStyleProps & {
    center?: boolean;
  };
