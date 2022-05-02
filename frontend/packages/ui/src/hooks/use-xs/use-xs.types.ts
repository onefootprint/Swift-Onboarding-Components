import * as CSS from 'csstype';
import type {
  BackgroundsColors,
  BorderColors,
  BorderRadius,
  BorderWidths,
  Colors,
  Elevations,
  Spacings,
} from 'styled';

export type CustomStyleProps = {
  backgroundColor?: BackgroundsColors;
  borderBottomColor?: BorderColors;
  borderBottomLeftRadius?: BorderRadius;
  borderBottomRightRadius?: BorderRadius;
  borderBottomWidth?: BorderWidths;
  borderColor?: BorderColors;
  borderLeftColor?: BorderColors;
  borderLeftWidth?: BorderWidths;
  borderRadius?: BorderRadius;
  borderRightColor?: BorderColors;
  borderRightWidth?: BorderWidths;
  borderTopColor?: BorderColors;
  borderTopLeftRadius?: BorderRadius;
  borderTopRightRadius?: BorderRadius;
  borderTopWidth?: BorderWidths;
  borderWidth?: BorderWidths;
  elevation?: Elevations;
  color?: Colors;
  columnGap?: Spacings;
  gap?: Spacings;
  margin?: Spacings;
  marginBottom?: Spacings;
  marginLeft?: Spacings;
  marginRight?: Spacings;
  marginTop?: Spacings;
  marginX?: Spacings;
  marginY?: Spacings;
  padding?: Spacings;
  paddingBottom?: Spacings;
  paddingLeft?: Spacings;
  paddingRight?: Spacings;
  paddingTop?: Spacings;
  paddingX?: Spacings;
  paddingY?: Spacings;
  rowGap?: Spacings;
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

export type XSStyles = BaseStyleProps &
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

export type XSStylesKeys = keyof XSStyles;

export type XSStyleProps = BaseStyleProps & CustomStyleProps;
