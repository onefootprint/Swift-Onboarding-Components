import type { BackgroundColor, FontVariant, Theme } from '@onefootprint/design-tokens';
import type * as CSS from 'csstype';
import type { HTMLAttributes } from 'react';

export type BoxStyleProps = {
  alignContent?: CSS.Property.AlignContent;
  alignItems?: CSS.Property.AlignItems;
  alignSelf?: CSS.Property.AlignSelf;
  backdropFilter?: CSS.Property.BackdropFilter;
  backfaceVisibility?: CSS.Property.BackfaceVisibility;
  backgroundBlendMode?: CSS.Property.BackgroundBlendMode;
  backgroundClip?: CSS.Property.BackgroundClip;
  backgroundImage?: CSS.Property.BackgroundImage;
  backgroundOrigin?: CSS.Property.BackgroundOrigin;
  backgroundPosition?: CSS.Property.BackgroundPosition;
  backgroundRepeat?: CSS.Property.BackgroundRepeat;
  backgroundSize?: CSS.Property.BackgroundSize;
  borderCollapse?: CSS.Property.BorderCollapse;
  borderSpacing?: CSS.Property.BorderSpacing;
  borderStyle?: CSS.Property.BorderStyle;
  bottom?: CSS.Property.Bottom;
  boxSizing?: CSS.Property.BoxSizing;
  clear?: CSS.Property.Clear;
  clip?: CSS.Property.Clip;
  columnCount?: CSS.Property.ColumnCount;
  columnFill?: CSS.Property.ColumnFill;
  columnRule?: CSS.Property.ColumnRule;
  columnRuleColor?: CSS.Property.ColumnRuleColor;
  columnRuleStyle?: CSS.Property.ColumnRuleStyle;
  columnRuleWidth?: CSS.Property.ColumnRuleWidth;
  columns?: CSS.Property.Columns;
  columnSpan?: CSS.Property.ColumnSpan;
  columnWidth?: CSS.Property.ColumnWidth;
  contain?: CSS.Property.Contain;
  content?: CSS.Property.Content;
  counterIncrement?: CSS.Property.CounterIncrement;
  counterReset?: CSS.Property.CounterReset;
  counterSet?: CSS.Property.CounterSet;
  cursor?: CSS.Property.Cursor;
  direction?: CSS.Property.Direction;
  display?: CSS.Property.Display;
  emptyCells?: CSS.Property.EmptyCells;
  filter?: CSS.Property.Filter;
  flex?: CSS.Property.Flex;
  flexBasis?: CSS.Property.FlexBasis;
  flexDirection?: CSS.Property.FlexDirection;
  flexFlow?: CSS.Property.FlexFlow;
  flexGrow?: CSS.Property.FlexGrow;
  flexShrink?: CSS.Property.FlexShrink;
  flexWrap?: CSS.Property.FlexWrap;
  float?: CSS.Property.Float;
  grid?: CSS.Property.Grid;
  gridArea?: CSS.Property.GridArea;
  gridAutoColumns?: CSS.Property.GridAutoColumns;
  gridAutoFlow?: CSS.Property.GridAutoFlow;
  gridAutoRows?: CSS.Property.GridAutoRows;
  gridColumn?: CSS.Property.GridColumn;
  gridColumnEnd?: CSS.Property.GridColumnEnd;
  gridColumnGap?: CSS.Property.GridColumnGap;
  gridColumnStart?: CSS.Property.GridColumnStart;
  gridGap?: CSS.Property.GridGap;
  gridRow?: CSS.Property.GridRow;
  gridRowEnd?: CSS.Property.GridRowEnd;
  gridRowGap?: CSS.Property.GridRowGap;
  gridRowStart?: CSS.Property.GridRowStart;
  gridTemplate?: CSS.Property.GridTemplate;
  gridTemplateAreas?: CSS.Property.GridTemplateAreas;
  gridTemplateColumns?: CSS.Property.GridTemplateColumns;
  gridTemplateRows?: CSS.Property.GridTemplateRows;
  height?: CSS.Property.Height;
  hyphens?: CSS.Property.Hyphens;
  justifyContent?: CSS.Property.JustifyContent;
  justifyItems?: CSS.Property.JustifyItems;
  justifySelf?: CSS.Property.JustifySelf;
  left?: CSS.Property.Left;
  letterSpacing?: CSS.Property.LetterSpacing;
  lineBreak?: CSS.Property.LineBreak;
  lineHeight?: CSS.Property.LineHeight;
  listStyle?: CSS.Property.ListStyle;
  listStyleImage?: CSS.Property.ListStyleImage;
  listStylePosition?: CSS.Property.ListStylePosition;
  listStyleType?: CSS.Property.ListStyleType;
  maxHeight?: CSS.Property.MaxHeight;
  maxWidth?: CSS.Property.MaxWidth;
  minHeight?: CSS.Property.MinHeight;
  minWidth?: CSS.Property.MinWidth;
  objectFit?: CSS.Property.ObjectFit;
  objectPosition?: CSS.Property.ObjectPosition;
  opacity?: CSS.Property.Opacity;
  order?: CSS.Property.Order;
  outline?: CSS.Property.Outline;
  overflow?: CSS.Property.Overflow;
  overflowWrap?: CSS.Property.OverflowWrap;
  overflowX?: CSS.Property.OverflowX;
  overflowY?: CSS.Property.OverflowY;
  perspective?: CSS.Property.Perspective;
  perspectiveOrigin?: CSS.Property.PerspectiveOrigin;
  placeContent?: CSS.Property.PlaceContent;
  placeItems?: CSS.Property.PlaceItems;
  placeSelf?: CSS.Property.PlaceSelf;
  pointerEvents?: CSS.Property.PointerEvents;
  position?: CSS.Property.Position;
  resize?: CSS.Property.Resize;
  right?: CSS.Property.Right;
  scrollBehavior?: CSS.Property.ScrollBehavior;
  tableLayout?: CSS.Property.TableLayout;
  tabSize?: CSS.Property.TabSize;
  textAlign?: CSS.Property.TextAlign;
  textAlignLast?: CSS.Property.TextAlignLast;
  textDecoration?: CSS.Property.TextDecoration;
  textDecorationColor?: CSS.Property.TextDecorationColor;
  textDecorationLine?: CSS.Property.TextDecorationLine;
  textDecorationStyle?: CSS.Property.TextDecorationStyle;
  textIndent?: CSS.Property.TextIndent;
  textJustify?: CSS.Property.TextJustify;
  textOverflow?: CSS.Property.TextOverflow;
  textShadow?: CSS.Property.TextShadow;
  textTransform?: CSS.Property.TextTransform;
  top?: CSS.Property.Top;
  transform?: CSS.Property.Transform;
  transformOrigin?: CSS.Property.TransformOrigin;
  transition?: CSS.Property.Transition;
  transitionDuration?: CSS.Property.TransitionDuration;
  transitionProperty?: CSS.Property.TransitionProperty;
  transitionTimingFunction?: CSS.Property.TransitionTimingFunction;
  userSelect?: CSS.Property.UserSelect;
  verticalAlign?: CSS.Property.VerticalAlign;
  visibility?: CSS.Property.Visibility;
  whiteSpace?: CSS.Property.WhiteSpace;
  width?: CSS.Property.Width;
  wordBreak?: CSS.Property.WordBreak;
  wordSpacing?: CSS.Property.WordSpacing;
  wordWrap?: CSS.Property.WordWrap;
  zIndex?: CSS.Property.ZIndex;

  // Theme props
  backgroundColor?: BackgroundColor;
  borderColor?: keyof Theme['borderColor'];
  borderPosition?: 'top' | 'right' | 'bottom' | 'left' | 'all';
  borderRadius?: keyof Theme['borderRadius'];
  borderWidth?: keyof Theme['borderWidth'];
  borderBottomWidth?: keyof Theme['borderWidth'];
  borderTopWidth?: keyof Theme['borderWidth'];
  borderLeftWith?: keyof Theme['borderWidth'];
  borderRightWidth?: keyof Theme['borderWidth'];
  color?: keyof Theme['color'];
  columnGap?: keyof Theme['spacing'];
  elevation?: keyof Theme['elevation'];
  fontStyle?: keyof Theme['typography'];
  gap?: keyof Theme['spacing'];
  margin?: keyof Theme['spacing'];
  marginInline?: keyof Theme['spacing'];
  marginBlock?: keyof Theme['spacing'];
  marginBottom?: keyof Theme['spacing'];
  marginLeft?: keyof Theme['spacing'];
  marginRight?: keyof Theme['spacing'];
  marginTop?: keyof Theme['spacing'];
  padding?: keyof Theme['spacing'];
  paddingBottom?: keyof Theme['spacing'];
  paddingLeft?: keyof Theme['spacing'];
  paddingRight?: keyof Theme['spacing'];
  paddingTop?: keyof Theme['spacing'];
  paddingInline?: keyof Theme['spacing'];
  paddingBlock?: keyof Theme['spacing'];
  rowGap?: keyof Theme['spacing'];
};

export type BoxPrimitives<T = Element> = BoxStyleProps &
  HTMLAttributes<T> & {
    as?: never;
    center?: boolean;
    className?: string;
    isPrivate?: boolean;
    tag?: React.ElementType;
    testID?: string;
  };

export type BoxProps = BoxPrimitives & {
  typography?: FontVariant;
};
