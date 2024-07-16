import type { Color } from '@onefootprint/design-tokens';
import type { Icon } from '@onefootprint/icons';
import React, { useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Text } from 'react-native';
import styled, { css } from 'styled-components/native';

import type { BoxProps } from '../box';
import Box from '../box';
import LoadingIndicator from '../loading-indicator';
import Pressable from '../pressable';
import type { ButtonVariant } from './button.types';

export type ButtonProps = BoxProps & {
  children: string;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  iconColor?: Color;
  prefixIcon?: Icon;
};

const Button = ({
  children,
  disabled = false,
  loading = false,
  loadingLabel,
  onPress,
  variant = 'primary',
  prefixIcon: PrefixIcon,
  iconColor = variant === 'primary' ? 'quinary' : 'primary',
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
        active={active}
        disabled={disabled}
        loading={loading}
        onPress={handlePress}
        onPressIn={() => setActive(true)}
        onPressOut={() => setActive(false)}
        variant={variant}
      >
        <Box display="flex" gap={3} justifyContent="center" alignItems="center" flexDirection="row">
          {PrefixIcon && <PrefixIcon color={iconColor} />}
          {!loading ? (
            <ButtonText variant={variant} disabled={disabled}>
              {children}
            </ButtonText>
          ) : (
            <HiddenButtonText>{children}</HiddenButtonText>
          )}
        </Box>
        <LoadingContainer loading={loading}>
          {loadingLabel ? (
            <Box flexDirection="row" justifyContent="space-between">
              <LoadingIndicator aria-label={loadingLabel} color={variant === 'primary' ? 'quinary' : 'primary'} />
              <ButtonText variant={variant} disabled={disabled}>
                {loadingLabel}
              </ButtonText>
              <Box />
            </Box>
          ) : (
            <LoadingIndicator aria-label={loadingLabel} color={variant === 'primary' ? 'quinary' : 'primary'} />
          )}
        </LoadingContainer>
      </StyledPressable>
    </Box>
  );
};

const StyledPressable = styled(Pressable)<{
  active?: boolean;
  loading: boolean;
  variant: ButtonVariant;
}>`
  ${({ theme, variant, active, loading, disabled }) => {
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
      border-radius: ${button.borderRadius};
      border-style: solid;
      border-width: ${button.borderWidth};
      color: ${button.variant[variant].color};
      height: ${button.height};
      justify-content: center;
      padding: 0 ${button.paddingHorizontal};
      position: relative;
      opacity: ${loading ? 0.7 : 1};
    `;
  }}
`;

const ButtonText = styled(Text)<{
  active?: boolean;
  disabled: boolean;
  variant: ButtonVariant;
}>`
  ${({ theme, variant, active, disabled }) => {
    const { button } = theme.components;
    let { color } = button.variant[variant];

    if (disabled) {
      color = button.variant[variant].disabled.color;
    } else if (active) {
      color = button.variant[variant].active.color;
    }

    return css`
      font: ${button.typography};
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
      opacity: ${loading ? 1 : 0};
      position: absolute;
      width: 100%;
    `;
  }}
`;

export default Button;
