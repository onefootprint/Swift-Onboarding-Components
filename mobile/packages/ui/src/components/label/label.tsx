import React from 'react';
import styled, { css } from 'styled-components/native';

import type { BoxProps } from '../box';
import Box from '../box';
import Pressable from '../pressable';

export type LabelProps = BoxProps & {
  children: string;
  hasError?: boolean;
  onPress?: () => void;
};

const Label = ({ children, onPress, hasError, ...props }: LabelProps) => {
  return (
    <Box {...props}>
      <Pressable onPress={onPress}>
        <Text hasError={hasError}>{children}</Text>
      </Pressable>
    </Box>
  );
};

const Text = styled.Text<{ hasError?: boolean }>`
  ${({ theme, hasError }) => {
    const { label } = theme.components;
    const color = hasError ? label.states.error.color : label.states.default.color;

    return css`
      color: ${color};
      font: ${label.size.default.typography};
    `;
  }}
`;
export default Label;
