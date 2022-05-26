import React from 'react';
import styled, { css } from 'styled';

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

const Button = ({
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
}: ButtonProps) => (
  <Container
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
  </Container>
);

const Container = styled.button<{
  size: 'default' | 'compact' | 'small' | 'large';
  variant: 'primary' | 'secondary';
  fullWidth?: boolean;
}>`
  ${({ theme, variant }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor[backgroundColors[variant]]};
    border-radius: ${theme.borderRadius[1]}px;
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
      font-family: ${theme.typography['label-2'].fontFamily};
      font-size: ${theme.typography['label-2'].fontSize};
      font-weight: ${theme.typography['label-2'].fontWeight};
      line-height: ${theme.typography['label-2'].lineHeight};
      padding: ${theme.spacing[4]}px ${theme.spacing[7]}px;
    `}

  ${({ theme, size }) =>
    size === 'compact' &&
    css`
      font-family: ${theme.typography['label-3'].fontFamily};
      font-size: ${theme.typography['label-3'].fontSize};
      font-weight: ${theme.typography['label-3'].fontWeight};
      line-height: ${theme.typography['label-3'].lineHeight};
      padding: ${theme.spacing[1] + theme.spacing[3]}px ${theme.spacing[7]}px;
    `}

    ${({ theme, size }) =>
    size === 'small' &&
    css`
      font-family: ${theme.typography['label-4'].fontFamily};
      font-size: ${theme.typography['label-4'].fontSize};
      font-weight: ${theme.typography['label-4'].fontWeight};
      line-height: ${theme.typography['label-4'].lineHeight};
      padding: ${theme.spacing[2]}px ${theme.spacing[4]}px;
    `}

    ${({ theme, size }) =>
    size === 'large' &&
    css`
      font-family: ${theme.typography['label-1'].fontFamily};
      font-size: ${theme.typography['label-1'].fontSize};
      font-weight: ${theme.typography['label-1'].fontWeight};
      line-height: ${theme.typography['label-1'].lineHeight};
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
    ${({ variant, theme }) => css`
      background: linear-gradient(
          ${theme.overlay[hoverBackgroundColor[variant]][1]},
          ${theme.overlay[hoverBackgroundColor[variant]][1]}
        ),
        linear-gradient(
          ${theme.backgroundColor[backgroundColors[variant]]},
          ${theme.backgroundColor[backgroundColors[variant]]}
        );
    `}
  }

  &:active:enabled {
    ${({ variant, theme }) => css`
      background: linear-gradient(
          ${theme.overlay[activeBackgroundColor[variant]][2]},
          ${theme.overlay[activeBackgroundColor[variant]][2]}
        ),
        linear-gradient(
          ${theme.backgroundColor[backgroundColors[variant]]},
          ${theme.backgroundColor[backgroundColors[variant]]}
        );
    `}
  }
`;

export default Button;
