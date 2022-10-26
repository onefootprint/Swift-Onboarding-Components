import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';
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
  form?: string;
  fullWidth?: boolean;
  loading?: boolean;
  loadingAriaLabel?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: ButtonSize;
  testID?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  sx?: SXStyleProps;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      disabled = false,
      form,
      fullWidth,
      loading,
      loadingAriaLabel,
      onClick,
      size = 'default',
      testID,
      type = 'button',
      variant = 'primary',
      sx,
    }: ButtonProps,
    ref,
  ) => {
    const sxStyles = useSX(sx);
    return (
      <ButtonContainer
        $fullWidth={fullWidth}
        $loading={loading}
        $size={size}
        $variant={variant}
        data-testid={testID}
        disabled={disabled}
        form={form}
        onClick={onClick}
        ref={ref}
        tabIndex={0}
        type={type}
        sx={sxStyles}
      >
        {loading ? (
          <LoadingIndicator
            aria-label={loadingAriaLabel}
            color={variant === 'primary' ? 'quinary' : 'primary'}
          />
        ) : (
          children
        )}
      </ButtonContainer>
    );
  },
);

const ButtonContainer = styled.button<{
  $fullWidth?: boolean;
  $loading?: boolean;
  $size: ButtonSize;
  $variant: ButtonVariant;
  sx?: SXStyles;
}>`
  ${({ theme, $variant, $fullWidth, $size, $loading, sx }) => css`
    ${createSizeStyles($size)};
    ${createVariantStyles($variant)};
    ${createFullWidthStyles($fullWidth)};
    ${createLoadingStyles($loading)};
    align-items: center;
    border-radius: ${theme.borderRadius.default}px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    outline-offset: ${theme.spacing[2]}px;
    text-decoration: none;
    user-select: none;
    ${sx};
  `}
`;

export default Button;
