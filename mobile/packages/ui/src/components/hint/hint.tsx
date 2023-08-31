/* eslint-disable react/jsx-props-no-spreading */
import styled, { css } from '@onefootprint/styled';
import React from 'react';

import { Box, BoxProps } from '../box';

export type HintSize = 'compact' | 'default';

export type HintProps = BoxProps & {
  children: string;
  hasError?: boolean;
  size?: 'compact' | 'default';
};

const Hint = ({
  children,
  hasError = false,
  size = 'default',
  ...props
}: HintProps) => (
  <Box {...props}>
    <HintContainer hasError={hasError} size={size}>
      {children}
    </HintContainer>
  </Box>
);

const HintContainer = styled.Text<{ hasError: boolean; size: HintSize }>`
  ${({ theme, size, hasError }) => {
    const { hint } = theme.components;

    return css`
      text-align: left;
      font: ${size === 'compact'
        ? hint.size.compact.typography
        : hint.size.default.typography};
      color: ${hasError ? hint.states.error.color : hint.states.default.color};
    `;
  }}
`;

export default Hint;
