/* eslint-disable react/jsx-props-no-spreading */
import type * as CSS from 'csstype';
import React, { forwardRef } from 'react';

import type { BoxPrimitives } from '../box';
import Box from '../box';

export type StackProps = Omit<BoxPrimitives<HTMLDivElement>, 'direction'> & {
  align?: CSS.Property.AlignItems;
  direction?: CSS.Property.FlexDirection;
  inline?: boolean;
  justify?: CSS.Property.JustifyContent;
};

const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ align, children, direction, inline, justify, right, ...props }: StackProps, ref) => (
    <Box
      alignItems={align}
      display={inline ? 'inline-flex' : 'flex'}
      flexDirection={direction}
      justifyContent={justify}
      ref={ref}
      tag={props.as}
      {...props}
    >
      {children}
    </Box>
  ),
);

export default Stack;
