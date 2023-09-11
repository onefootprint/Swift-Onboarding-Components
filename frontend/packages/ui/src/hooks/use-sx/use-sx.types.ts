import type {
  BackgroundColor,
  BorderColor,
  BorderRadius,
  BorderWidth,
  Color,
  Elevation,
  Spacing,
} from '@onefootprint/design-tokens';
import type * as CSS from 'csstype';

export type CustomStyleProps = {
  backgroundColor?: BackgroundColor;
  borderBottomColor?: BorderColor;
  borderBottomLeftRadius?: BorderRadius;
  borderBottomRightRadius?: BorderRadius;
  borderBottomWidth?: BorderWidth;
  borderColor?: BorderColor;
  borderLeftColor?: BorderColor;
  borderLeftWidth?: BorderWidth;
  borderRadius?: BorderRadius;
  borderRightColor?: BorderColor;
  borderRightWidth?: BorderWidth;
  borderTopColor?: BorderColor;
  borderTopLeftRadius?: BorderRadius;
  borderTopRightRadius?: BorderRadius;
  borderTopWidth?: BorderWidth;
  borderWidth?: BorderWidth;
  elevation?: Elevation;
  color?: Color;
  columnGap?: Spacing;
  gap?: Spacing;
  margin?: Spacing;
  marginBottom?: Spacing;
  marginLeft?: Spacing;
  marginRight?: Spacing;
  marginTop?: Spacing;
  marginX?: Spacing;
  marginY?: Spacing;
  padding?: Spacing;
  paddingBottom?: Spacing;
  paddingLeft?: Spacing;
  paddingRight?: Spacing;
  paddingTop?: Spacing;
  paddingX?: Spacing;
  paddingY?: Spacing;
  rowGap?: Spacing;
};

export type BaseStyleProps = Pick<
  CSS.Properties,
  | 'alignContent'
  | 'alignItems'
  | 'alignSelf'
  | 'animation'
  | 'appearance'
  | 'backgroundBlendMode'
  | 'backgroundClip'
  | 'backgroundImage'
  | 'backgroundOrigin'
  | 'backgroundPosition'
  | 'backgroundRepeat'
  | 'backgroundSize'
  | 'borderBottomStyle'
  | 'borderBottomStyle'
  | 'borderLeftStyle'
  | 'borderRightStyle'
  | 'borderStyle'
  | 'borderTopStyle'
  | 'bottom'
  | 'boxSizing'
  | 'cursor'
  | 'display'
  | 'flex'
  | 'flexBasis'
  | 'flexDirection'
  | 'flexFlow'
  | 'flexGrow'
  | 'flexShrink'
  | 'flexWrap'
  | 'gridArea'
  | 'gridAutoFlow'
  | 'gridAutoRows'
  | 'gridColumn'
  | 'gridRow'
  | 'gridTemplateAreas'
  | 'gridTemplateColumns'
  | 'gridTemplateRows'
  | 'height'
  | 'justifyContent'
  | 'justifyItems'
  | 'justifySelf'
  | 'left'
  | 'letterSpacing'
  | 'lineHeight'
  | 'maxHeight'
  | 'maxWidth'
  | 'minHeight'
  | 'minWidth'
  | 'objectFit'
  | 'objectPosition'
  | 'opacity'
  | 'order'
  | 'overflow'
  | 'overflowX'
  | 'overflowY'
  | 'pointerEvents'
  | 'position'
  | 'right'
  | 'textAlign'
  | 'textDecoration'
  | 'textOverflow'
  | 'textTransform'
  | 'top'
  | 'transform'
  | 'transformOrigin'
  | 'transition'
  | 'userSelect'
  | 'visibility'
  | 'whiteSpace'
  | 'width'
  | 'willChange'
  | 'zIndex'
>;

export type SXStyles = BaseStyleProps &
  Pick<
    CSS.Properties,
    | 'backgroundColor'
    | 'borderBottomColor'
    | 'borderBottomLeftRadius'
    | 'borderBottomRightRadius'
    | 'borderBottomWidth'
    | 'borderColor'
    | 'borderLeftColor'
    | 'borderLeftWidth'
    | 'borderRadius'
    | 'borderRightColor'
    | 'borderRightWidth'
    | 'borderTopColor'
    | 'borderTopLeftRadius'
    | 'borderTopRightRadius'
    | 'borderTopWidth'
    | 'borderWidth'
    | 'boxShadow'
    | 'color'
    | 'color'
    | 'columnGap'
    | 'gap'
    | 'margin'
    | 'marginBottom'
    | 'marginLeft'
    | 'marginRight'
    | 'marginTop'
    | 'padding'
    | 'paddingBottom'
    | 'paddingLeft'
    | 'paddingRight'
    | 'paddingTop'
    | 'rowGap'
  >;

export type SXStylesKeys = keyof SXStyles;

export type SXStyleProps = BaseStyleProps & CustomStyleProps;
