import React from 'react';
import styled, { css } from 'styled-components';

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
  onPress?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: 'default' | 'compact';
  testID?: string;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
};

const Button = ({
  children,
  disabled = false,
  fullWidth,
  onPress,
  size = 'default',
  testID,
  type = 'button',
  variant = 'primary',
}: ButtonProps) => (
  <Container
    data-testid={testID}
    disabled={disabled}
    fullWidth={fullWidth}
    onClick={onPress}
    size={size}
    tabIndex={0}
    type={type}
    variant={variant}
  >
    {children}
  </Container>
);

const Container = styled.button<{
  size: 'default' | 'compact';
  variant: 'primary' | 'secondary';
  fullWidth?: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 0;

  ${({ theme, variant }) => css`
    background-color: ${theme.backgroundColors[backgroundColors[variant]]};
    border-radius: ${theme.borderRadius[1]}px;
    box-shadow: 0 ${theme.borderWidths[1]}px ${theme.borderWidths[1]}px
        rgb(0 0 0 / 0%),
      0 0 0 ${theme.borderWidths[1]}px
        ${theme.borderColors[borderColors[variant]]};
    color: ${theme.colors[colors[variant]]};
    cursor: pointer;
    text-decoration: none;
  `}

  ${({ theme, size }) =>
    size === 'default' &&
    css`
      font-family: ${theme.typographies['label-2'].fontFamily};
      font-size: ${theme.typographies['label-2'].fontSize}px;
      font-weight: ${theme.typographies['label-2'].fontWeight};
      line-height: ${theme.typographies['label-2'].lineHeight}px;
      padding: ${theme.spacings[4]}px ${theme.spacings[7]}px;
    `}

  ${({ theme, size }) =>
    size === 'compact' &&
    css`
      font-family: ${theme.typographies['label-3'].fontFamily};
      font-size: ${theme.typographies['label-3'].fontSize}px;
      font-weight: ${theme.typographies['label-3'].fontWeight};
      line-height: ${theme.typographies['label-3'].lineHeight}px;
      padding: ${theme.spacings[1] + theme.spacings[3]}px ${theme.spacings[7]}px;
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
          ${theme.overlays[hoverBackgroundColor[variant]][1]},
          ${theme.overlays[hoverBackgroundColor[variant]][1]}
        ),
        linear-gradient(
          ${theme.backgroundColors[backgroundColors[variant]]},
          ${theme.backgroundColors[backgroundColors[variant]]}
        );
    `}

  &:active:enabled {
    ${({ variant, theme }) => css`
      background: linear-gradient(
          ${theme.overlays[activeBackgroundColor[variant]][2]},
          ${theme.overlays[activeBackgroundColor[variant]][2]}
        ),
        linear-gradient(
          ${theme.backgroundColors[backgroundColors[variant]]},
          ${theme.backgroundColors[backgroundColors[variant]]}
        );
    `}
`;

export default Button;
