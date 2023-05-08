import type { BoxProps } from './box.types';

const filterStyleProps = (props: BoxProps): Partial<BoxProps> => {
  const allowedProps = [
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
  ];

  const filteredProps: Partial<BoxProps> = {};
  Object.keys(props).forEach(key => {
    if (allowedProps.includes(key as keyof BoxProps)) {
      // @ts-ignore
      filteredProps[key as keyof BoxProps] = props[key as keyof BoxProps];
    }
  });
  return filteredProps;
};

export default filterStyleProps;
