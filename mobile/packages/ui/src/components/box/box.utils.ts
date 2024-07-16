import type { ViewProps } from 'react-native';

import type { BoxProps, BoxStyleProps } from './box.types';

const styleKeyProps = [
  'alignItems',
  'justifyContent',
  'alignSelf',
  'aspectRatio',
  'borderBottomWidth',
  'display',
  'end',
  'flex',
  'flexBasis',
  'flexDirection',
  'flexGrow',
  'flexShrink',
  'flexWrap',
  'height',
  'left',
  'overflow',
  'position',
  'right',
  'top',
  'visibility',
  'width',
  'zIndex',
  'opacity',
  'gap',
  'rowGap',
  'margin',
  'marginBottom',
  'marginEnd',
  'marginHorizontal',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginTop',
  'marginVertical',
  'padding',
  'paddingBottom',
  'paddingEnd',
  'paddingHorizontal',
  'paddingLeft',
  'paddingRight',
  'paddingStart',
  'paddingTop',
  'paddingVertical',
  'backgroundColor',
  'borderBottomColor',
  'borderRadius',
  'borderBottomEndRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomStartRadius',
  'borderColor',
  'borderEndColor',
  'borderLeftColor',
  'borderRightColor',
  'borderStartColor',
  'borderTopColor',
  'borderTopEndRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopStartRadius',
  'transform',
  'transformMatrix',
  'rotation',
  'scaleX',
  'scaleY',
  'translateX',
  'translateY',
  'elevation',
];

const filterProps = (props: BoxProps) => {
  const styleProps: Partial<BoxStyleProps> = {};
  const viewProps: Partial<ViewProps> = {};

  Object.keys(props).forEach(key => {
    if (styleKeyProps.includes(key)) {
      // @ts-ignore
      styleProps[key as keyof BoxStyleProps] = props[key as keyof BoxStyleProps];
    } else {
      // @ts-ignore
      viewProps[key as keyof ViewProps] = props[key as keyof ViewProps];
    }
  });
  return { styleProps, viewProps };
};

export default filterProps;
