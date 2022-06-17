import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles, createOverlayBackground } from '../../utils/mixins';
import LoadingIndicator from '../loading-indicator';
import {
  activeBackgroundColor,
  backgroundColors,
  borderColors,
  colors,
  hoverBackgroundColor,
} from './button.constants';

export type ButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  loadingAriaLabel?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: 'default' | 'compact' | 'small' | 'large';
  testID?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
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
      ref={ref}
      data-testid={testID}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      onClick={onClick}
      size={size}
      tabIndex={0}
      type={type}
      variant={variant}
    >
      {loading ? (
        <LoadingIndicator aria-label={loadingAriaLabel} color="quaternary" />
      ) : (
        children
      )}
    </ButtonContainer>
  ),
);

const ButtonContainer = styled.button<{
  size: 'default' | 'compact' | 'small' | 'large';
  variant: 'primary' | 'secondary';
  fullWidth?: boolean;
}>`
  ${({ theme, variant }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor[backgroundColors[variant]]};
    border-radius: ${theme.borderRadius[2]}px;
    border: 0;
    box-shadow: 0 ${theme.borderWidth[1]}px ${theme.borderWidth[1]}px
        rgb(0 0 0 / 0%),
      0 0 0 ${theme.borderWidth[1]}px
        ${theme.borderColor[borderColors[variant]]};
    color: ${theme.color[colors[variant]]};
    cursor: pointer;
    display: flex;
    justify-content: center;
    text-decoration: none;
    user-select: none;
  `}
  ${({ theme, size }) =>
    size === 'default' &&
    css`
      ${createFontStyles('label-2')};
      padding: ${theme.spacing[4]}px ${theme.spacing[7]}px;
    `}
  ${({ theme, size }) =>
    size === 'compact' &&
    css`
      ${createFontStyles('label-3')};
      padding: ${theme.spacing[1] + theme.spacing[3]}px ${theme.spacing[7]}px;
    `}
    ${({ theme, size }) =>
    size === 'small' &&
    css`
      ${createFontStyles('label-4')};
      padding: ${theme.spacing[2]}px ${theme.spacing[4]}px;
    `}
    ${({ theme, size }) =>
    size === 'large' &&
    css`
      ${createFontStyles('label-1')};
      padding: ${theme.spacing[5]}px ${theme.spacing[7]}px;
    `}
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  &:hover:enabled {
    ${({ variant }) => css`
      ${createOverlayBackground(
        hoverBackgroundColor[variant],
        backgroundColors[variant],
      )}
    `}
  }
  &:active:enabled {
    ${({ variant }) => css`
      ${createOverlayBackground(
        activeBackgroundColor[variant],
        backgroundColors[variant],
      )}
    `}
  }
`;

export default Button;
