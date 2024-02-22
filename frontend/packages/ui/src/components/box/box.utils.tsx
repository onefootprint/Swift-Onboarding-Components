import type { BoxProps } from './box.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getPadding = (props: BoxProps, theme: any) => {
  if (
    props.paddingTop ||
    props.paddingBottom ||
    props.paddingLeft ||
    props.paddingRight
  ) {
    return `${
      props.paddingTop ? theme.spacing[props.paddingTop] : theme.spacing[0]
    } ${
      props.paddingRight ? theme.spacing[props.paddingRight] : theme.spacing[0]
    } ${
      props.paddingBottom
        ? theme.spacing[props.paddingBottom]
        : theme.spacing[0]
    } ${props.paddingLeft ? theme.spacing[props.paddingLeft] : theme.spacing[0]}
    `;
  }
  if (props.padding) {
    return `${theme.spacing[props.padding]}`;
  }
  return undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMargin = (props: BoxProps, theme: any) => {
  if (
    props.marginTop ||
    props.marginBottom ||
    props.marginLeft ||
    props.marginRight
  ) {
    return `${
      props.marginTop ? theme.spacing[props.marginTop] : theme.spacing[0]
    } ${
      props.marginRight ? theme.spacing[props.marginRight] : theme.spacing[0]
    } ${
      props.marginBottom ? theme.spacing[props.marginBottom] : theme.spacing[0]
    } ${props.marginLeft ? theme.spacing[props.marginLeft] : theme.spacing[0]}`;
  }
  if (props.margin) {
    return `${props.margin}`;
  }
  return undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getBorders = (props: BoxProps, theme: any) => {
  if (
    props.borderPosition &&
    props.borderPosition !== 'all' &&
    props.borderWidth &&
    props.borderColor
  ) {
    return `border-${props.borderPosition}:  ${
      theme.borderWidth[props.borderWidth]
    } solid ${props.borderColor && theme.borderColor[props.borderColor]};`;
  }
  if (props.borderWidth && props.borderColor) {
    return `border: ${theme.borderWidth[props.borderWidth]} solid ${
      props.borderColor && theme.borderColor[props.borderColor]
    };`;
  }
  return undefined;
};
