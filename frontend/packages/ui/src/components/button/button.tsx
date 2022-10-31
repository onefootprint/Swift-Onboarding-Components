import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import { createTypography } from '../../utils/mixins';
import LoadingIndicator from '../loading-indicator';
import type { ButtonSize, ButtonVariant } from './button.types';

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
        className="fp-button"
        data-full-width={fullWidth}
        data-loading={loading}
        data-size={size}
        data-testid={testID}
        data-variant={variant}
        disabled={disabled}
        form={form}
        onClick={onClick}
        ref={ref}
        size={size}
        sx={sxStyles}
        tabIndex={0}
        type={type}
        variant={variant}
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
  size: ButtonSize;
  variant: ButtonVariant;
  sx?: SXStyles;
}>`
  ${({ theme, variant, size, sx }) => {
    const { button } = theme.components;

    return css`
      ${createTypography(button.size[size].typography)};
      box-shadow: ${button.global.elevation.initial};
      align-items: center;
      background-color: ${button.variant[variant].bg.initial};
      border-color: ${button.variant[variant].border.initial};
      border-radius: ${button.global.borderRadius}px;
      border-style: solid;
      border-width: ${button.global.borderWidth}px;
      color: ${button.variant[variant].color.initial};
      cursor: pointer;
      display: flex;
      height: ${button.size[size].height}px;
      justify-content: center;
      outline-offset: ${button.global.outlineOffset}px;
      padding: 0 ${button.size[size].paddingHorizontal}px;
      text-decoration: none;
      user-select: none;
      ${sx};

      &:hover {
        box-shadow: ${button.global.elevation.initial};
        background-color: ${button.variant[variant].bg.hover};
        border-color: ${button.variant[variant].border.hover};
        color: ${button.variant[variant].color.hover};
      }

      &:active {
        box-shadow: ${button.global.elevation.active};
        background-color: ${button.variant[variant].bg.active};
        border-color: ${button.variant[variant].border.active};
        color: ${button.variant[variant].color.active};
      }

      &:disabled {
        cursor: not-allowed;
        background-color: ${button.variant[variant].bg.disabled};
        border-color: ${button.variant[variant].border.disabled};
        color: ${button.variant[variant].color.disabled};
      }

      &[data-loading='true'] {
        background-color: ${button.variant[variant].bg.loading};
        color: ${button.variant[variant].color.loading};
        pointer-event: none;

        path {
          fill: ${button.variant[variant].color.loading};
        }
      }

      &[data-full-width='true'] {
        width: 100%;
      }
    `;
  }}
`;

export default Button;
