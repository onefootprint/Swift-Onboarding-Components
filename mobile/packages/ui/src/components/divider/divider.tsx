import React from 'react';
import styled, { css } from 'styled-components/native';

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
