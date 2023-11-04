/* eslint-disable react/jsx-props-no-spreading */
import styled, { css } from '@onefootprint/styled';
import React from 'react';

import type { BoxProps } from '../box';
import Box from '../box';

export type DividerProps = BoxProps;

const Divider = ({ children, ...props }: DividerProps) => {
  return <StyledBox {...props}>{children}</StyledBox>;
};

const StyledBox = styled(Box)`
  ${({ theme }) => css`
    width: 100%;
    height: 1px;
    background: ${theme.borderColor.tertiary};
  `}
`;

export default Divider;
