import type { HTMLAttributes } from 'react';

import type { BoxStyleProps } from './box.types';

export const styleKeyProps: string[] = [
  'alignContent',
  'alignItems',
  'alignSelf',
  'backdropFilter',
  'backfaceVisibility',
  'backgroundBlendMode',
  'backgroundClip',
  'backgroundImage',
  'backgroundOrigin',
  'backgroundPosition',
  'backgroundRepeat',
  'backgroundSize',
  'borderCollapse',
  'borderSpacing',
  'bottom',
  'boxSizing',
  'clear',
  'clip',
  'columnCount',
  'columnFill',
  'columnGap',
  'columnRule',
  'columnRuleColor',
  'columnRuleStyle',
  'columnRuleWidth',
  'columns',
  'columnSpan',
  'columnWidth',
  'contain',
  'content',
  'counterIncrement',
  'counterReset',
  'counterSet',
  'cursor',
  'display',
  'emptyCells',
  'filter',
  'flex',
  'flexBasis',
  'flexDirection',
  'flexFlow',
  'flexGrow',
  'flexShrink',
  'flexWrap',
  'float',
  'Gap',
  'Grid',
  'GridArea',
  'GridAutoColumns',
  'GridAutoFlow',
  'GridAutoRows',
  'GridColumn',
  'GridColumnEnd',
  'GridColumnGap',
  'GridColumnStart',
  'GridGap',
  'GridRow',
  'GridRowEnd',
  'GridRowGap',
  'GridRowStart',
  'GridTemplate',
  'GridTemplateAreas',
  'GridTemplateColumns',
  'GridTemplateRows',
  'height',
  'hyphens',
  'justifyContent',
  'justifyItems',
  'justifySelf',
  'left',
  'letterSpacing',
  'lineBreak',
  'lineHeight',
  'listStyle',
  'listStyleImage',
  'listStylePosition',
  'listStyleType',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'objectFit',
  'objectPosition',
  'opacity',
  'order',
  'outline',
  'overflow',
  'overflowWrap',
  'overflowX',
  'overflowY',
  'perspective',
  'perspectiveOrigin',
  'placeContent',
  'placeItems',
  'placeSelf',
  'pointerEvents',
  'position',
  'resize',
  'right',
  'rirection',
  'risplay',
  'rowGap',
  'scrollBehavior',
  'tableLayout',
  'tabSize',
  'textAlign',
  'textAlignLast',
  'textDecoration',
  'textDecorationColor',
  'textDecorationLine',
  'textDecorationStyle',
  'textIndent',
  'textJustify',
  'textOverflow',
  'textShadow',
  'textTransform',
  'top',
  'transform',
  'transformOrigin',
  'transition',
  'transitionDuration',
  'transitionProperty',
  'transitionTimingFunction',
  'userSelect',
  'verticalAlign',
  'visibility',
  'whiteSpace',
  'width',
  'wordBreak',
  'wordSpacing',
  'wordWrap',
  'zIndex',
  'backgroundColor',
  'borderColor',
  'borderPosition',
  'borderRadius',
  'borderWidth',
  'elevation',
  'fontStyle',
  'gap',
  'margin',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginX',
  'marginY',
  'padding',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingX',
  'paddingY',
  'surfaceColor',
];

export const filterProps = (props: BoxStyleProps) => {
  const styleProps: Partial<BoxStyleProps> = {};
  const elProps: Partial<HTMLAttributes<Element>> = {};

  Object.keys(props).forEach(key => {
    if (styleKeyProps.includes(key)) {
      // @ts-ignore
      styleProps[key] = props[key];
    } else {
      // @ts-ignore
      elProps[key] = props[key];
    }
  });
  return { styleProps, ...elProps };
};
