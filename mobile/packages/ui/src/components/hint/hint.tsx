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

const HintContainer = styled.View<{ hasError: boolean; size: HintSize }>`
  ${({ theme, size, hasError }) => {
    const { inputHint } = theme.components;

    return css`
      text-align: left;
      font: ${size === 'compact'
        ? inputHint.size.compact.typography
        : inputHint.size.default.typography};
      color: ${hasError
        ? inputHint.states.error.color
        : inputHint.states.error.color};
    `;
  }}
`;

export default Hint;
