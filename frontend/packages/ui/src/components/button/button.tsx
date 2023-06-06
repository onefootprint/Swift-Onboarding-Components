import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import Box from '../box';
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
        {!loading ? (
          children
        ) : (
          <Box as="span" sx={{ visibility: 'hidden' }}>
            {children}
          </Box>
        )}
        <Box
          sx={{
            visibility: loading ? 'visible' : 'hidden',
            position: 'absolute',
          }}
        >
          <LoadingIndicator
            aria-label={loadingAriaLabel}
            color={variant === 'primary' ? 'quinary' : 'primary'}
          />
        </Box>
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
      font: ${button.size[size].typography};
      align-items: center;
      background-color: ${button.variant[variant].bg};
      border-color: ${button.variant[variant].borderColor};
      border-radius: ${button.global.borderRadius};
      border-style: solid;
      border-width: ${button.global.borderWidth};
      color: ${button.variant[variant].color};
      cursor: pointer;
      display: flex;
      height: ${button.size[size].height};
      position: relative;
      justify-content: center;
      outline-offset: ${theme.spacing[2]};
      padding: 0 ${button.size[size].paddingHorizontal};
      user-select: none;
      ${sx};

      @media (hover: hover) {
        &:hover:enabled {
          background-color: ${button.variant[variant].hover.bg};
          border-color: ${button.variant[variant].hover.borderColor};
          color: ${button.variant[variant].hover.color};
        }
      }

      &:active:enabled {
        background-color: ${button.variant[variant].active.bg};
        border-color: ${button.variant[variant].active.borderColor};
        color: ${button.variant[variant].active.color};
      }

      &[data-loading='true'] {
        background-color: ${button.variant[variant].loading.bg};
        color: ${button.variant[variant].loading.color};
        pointer-event: none;

        path {
          fill: ${button.variant[variant].loading.color};
        }
      }

      &:disabled {
        cursor: initial;
        background-color: ${button.variant[variant].disabled.bg};
        border-color: ${button.variant[variant].disabled.borderColor};
        color: ${button.variant[variant].disabled.color};

        path {
          fill: ${button.variant[variant].disabled.color};
        }
      }

      &[data-full-width='true'] {
        width: 100%;
      }
    `;
  }}
`;

export default Button;
