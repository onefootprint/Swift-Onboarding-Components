/* eslint-disable react/jsx-props-no-spreading */
import styled, { css } from '@onefootprint/styled';
import React, { useState } from 'react';
import { GestureResponderEvent, Text } from 'react-native';

import { Box, BoxProps } from '../box';
import { LoadingIndicator } from '../loading-indicator';
import { Pressable } from '../pressable';
import type { ButtonSize, ButtonVariant } from './button.types';

export type ButtonProps = BoxProps & {
  children: string;
  disabled?: boolean;
  loading?: boolean;
  loadingAriaLabel?: string;
  onPress?: (event: GestureResponderEvent) => void;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const Button = ({
  children,
  disabled = false,
  loading = false,
  loadingAriaLabel,
  onPress,
  size = 'default',
  variant = 'primary',
  ...props
}: ButtonProps) => {
  const [active, setActive] = useState(false);

  const handlePress = (event: GestureResponderEvent) => {
    if (loading || disabled) return;
    onPress?.(event);
  };

  return (
    <Box {...props}>
      <StyledPressable
        disabled={disabled}
        loading={loading}
        onPress={handlePress}
        onPressIn={() => setActive(true)}
        onPressOut={() => setActive(false)}
        active={active}
        size={size}
        variant={variant}
      >
        {!loading ? (
          <ButtonText variant={variant} disabled={disabled} size={size}>
            {children}
          </ButtonText>
        ) : (
          <HiddenButtonText>{children}</HiddenButtonText>
        )}
        <LoadingContainer loading={loading}>
          <LoadingIndicator
            aria-label={loadingAriaLabel}
            color={variant === 'primary' ? 'quinary' : 'primary'}
          />
        </LoadingContainer>
      </StyledPressable>
    </Box>
  );
};

const StyledPressable = styled(Pressable)<{
  active?: boolean;
  loading: boolean;
  size: ButtonSize;
  variant: ButtonVariant;
}>`
  ${({ theme, size, variant, active, disabled }) => {
    const { button } = theme.components;
    let backgroundColor = button.variant[variant].bg;
    let { borderColor } = button.variant[variant];

    if (disabled) {
      backgroundColor = button.variant[variant].disabled.bg;
      borderColor = button.variant[variant].disabled.borderColor;
    } else if (active) {
      backgroundColor = button.variant[variant].active.bg;
      borderColor = button.variant[variant].active.borderColor;
    }

    return css`
      align-items: center;
      background-color: ${backgroundColor};
      border-color: ${borderColor};
      border-radius: ${button.global.borderRadius};
      border-style: solid;
      border-width: ${button.global.borderWidth};
      color: ${button.variant[variant].color};
      height: ${button.size[size].height};
      justify-content: center;
      padding: 0 ${button.size[size].paddingHorizontal};
      position: relative;
    `;
  }}
`;

const ButtonText = styled(Text)<{
  active?: boolean;
  disabled: boolean;
  size: ButtonSize;
  variant: ButtonVariant;
}>`
  ${({ theme, size, variant, active, disabled }) => {
    const { button } = theme.components;
    let { color } = button.variant[variant];

    if (disabled) {
      color = button.variant[variant].disabled.color;
    } else if (active) {
      color = button.variant[variant].active.color;
    }

    return css`
      font: ${button.size[size].typography};
      color: ${color};
    `;
  }}
`;

const HiddenButtonText = styled(Text)`
  opacity: 0;
`;

const LoadingContainer = styled.View<{
  loading: boolean;
}>`
  ${({ loading }) => {
    return css`
      position: absolute;
      opacity: ${loading ? 1 : 0};
    `;
  }}
`;

export default Button;
