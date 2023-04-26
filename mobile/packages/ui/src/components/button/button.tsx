import styled, { css } from '@onefootprint/styled';
import * as React from 'react';
import { GestureResponderEvent, Text } from 'react-native';

import { LoadingIndicator } from '../loading-indicator';
import { Pressable } from '../pressable';
import type { ButtonSize, ButtonVariant } from './button.types';

export type ButtonProps = {
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
  size = 'default',
  variant = 'primary',
  onPress,
}: ButtonProps) => {
  return (
    <ButtonContainer
      disabled={disabled}
      loading={loading}
      onPress={onPress}
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
      <LoandingIndicatorContainer loading={loading}>
        <LoadingIndicator
          aria-label={loadingAriaLabel}
          color={variant === 'primary' ? 'quinary' : 'primary'}
        />
      </LoandingIndicatorContainer>
    </ButtonContainer>
  );
};

const ButtonContainer = styled(Pressable)<{
  loading: boolean;
  size: ButtonSize;
  variant: ButtonVariant;
}>`
  ${({ theme, size, variant }) => {
    const { button } = theme.components;

    return css`
      display: inline;
      align-items: center;
      background-color: ${button.variant[variant].bg};
      border-color: ${button.variant[variant].borderColor};
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

  ${({ theme, variant, disabled }) => {
    if (!disabled) return;
    const { button } = theme.components;
    return css`
      background-color: ${button.variant[variant].disabled.bg};
      border-color: ${button.variant[variant].disabled.borderColor};
    `;
  }}
`;

const ButtonText = styled(Text)<{
  variant: ButtonVariant;
  size: ButtonSize;
  disabled: boolean;
}>`
  ${({ theme, size, disabled, variant }) => {
    const { button } = theme.components;
    return css`
      font: ${button.size[size].typography};
      color: ${disabled
        ? button.variant[variant].disabled.color
        : button.variant[variant].color};
    `;
  }}
`;

const HiddenButtonText = styled(Text)`
  opacity: 0;
`;

const LoandingIndicatorContainer = styled.View<{
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
