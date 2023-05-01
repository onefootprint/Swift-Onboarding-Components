/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import { Box, BoxProps } from '../box';

export type ContainerProps = BoxProps;

const Container = ({ children, ...props }: ContainerProps) => {
  return (
    <Box
      {...props}
      backgroundColor="primary"
      flex={1}
      paddingHorizontal={5}
      paddingTop={5}
    >
      {children}
    </Box>
  );
};

export default Container;
