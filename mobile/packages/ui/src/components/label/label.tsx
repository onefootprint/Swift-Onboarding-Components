import styled, { css } from '@onefootprint/styled';
import React from 'react';

import { Box } from '../box';
import { Pressable } from '../pressable';

export type LabelProps = {
  children: string;
  hasError?: boolean;
  onPress?: () => void;
};

const Label = ({ children, onPress, hasError = false }: LabelProps) => {
  return (
    <Box marginBottom={3}>
      <Pressable onPress={onPress}>
        <Text hasError={hasError}>{children}</Text>
      </Pressable>
    </Box>
  );
};

const Text = styled.Text<{ hasError: boolean }>`
  ${({ theme }) => {
    const { label } = theme.components;
    return css`
      color: ${label.states.default.color};
      font: ${label.size.default.typography};
    `;
  }}
  ${({ theme, hasError }) => {
    if (!hasError) return;
    const { label } = theme.components;
    return css`
      color: ${label.states.error.color};
    `;
  }}
`;

export default Label;
