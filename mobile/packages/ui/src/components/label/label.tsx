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
      <Pressable onPress={onPress} activeOpacity={1}>
        <Text hasError={hasError}>{children}</Text>
      </Pressable>
    </Box>
  );
};

const Text = styled.Text<{ hasError: boolean }>`
  ${({ theme, hasError }) => {
    const { inputLabel } = theme.components;
    const color = hasError
      ? inputLabel.states.error.color
      : inputLabel.states.default.color;
    const { typography } = inputLabel.size.default;

    return css`
      color: ${color};
      font: ${typography};
    `;
  }}
`;

export default Label;
