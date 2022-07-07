import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import LoadingIndicator from '../loading-indicator';
import type { ButtonSize, ButtonVariant } from './button.types';
import {
  createFullWidthStyles,
  createLoadingStyles,
  createSizeStyles,
  createVariantStyles,
} from './button.utils';

export type ButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  loadingAriaLabel?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: ButtonSize;
  testID?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      disabled = false,
      fullWidth,
      loading,
      loadingAriaLabel,
      onClick,
      size = 'default',
      testID,
      type = 'button',
      variant = 'primary',
    }: ButtonProps,
    ref,
  ) => (
    <ButtonContainer
      $fullWidth={fullWidth}
      $loading={loading}
      $size={size}
      $variant={variant}
      data-testid={testID}
      disabled={disabled}
      onClick={onClick}
      ref={ref}
      tabIndex={0}
      type={type}
    >
      {loading ? (
        <LoadingIndicator aria-label={loadingAriaLabel} color="quinary" />
      ) : (
        children
      )}
    </ButtonContainer>
  ),
);

const ButtonContainer = styled.button<{
  $fullWidth?: boolean;
  $loading?: boolean;
  $size: ButtonSize;
  $variant: ButtonVariant;
}>`
  ${({ theme, $variant, $fullWidth, $size, $loading }) => css`
    ${createSizeStyles($size)};
    ${createVariantStyles($variant)};
    ${createFullWidthStyles($fullWidth)};
    ${createLoadingStyles($loading)};
    align-items: center;
    border-radius: ${theme.borderRadius[2]}px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    outline-offset: ${theme.spacing[2]}px;
    text-decoration: none;
    user-select: none;
  `}
`;

export default Button;
