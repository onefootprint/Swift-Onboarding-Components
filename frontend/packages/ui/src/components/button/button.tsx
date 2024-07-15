/* eslint-disable react/jsx-props-no-spreading */
import type { Color } from '@onefootprint/design-tokens';
import type { Icon } from '@onefootprint/icons';
import type { ButtonHTMLAttributes } from 'react';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { createText } from '../../utils/mixins';
import AnimatedLoadingSpinner from '../animated-loading-spinner';
import Box from '../box';
import Stack from '../stack';
import type { ButtonSize, ButtonVariant } from './button.types';

export type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  form?: string;
  fullWidth?: boolean;
  iconColor?: Color;
  loading?: boolean;
  loadingAriaLabel?: string;
  prefixIcon?: Icon;
  size?: ButtonSize;
  testID?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      disabled = false,
      form,
      fullWidth,
      loading,
      loadingAriaLabel,
      size = 'default',
      testID,
      type = 'button',
      variant = 'primary',
      prefixIcon: PrefixIcon,
      iconColor,
      ...props
    }: ButtonProps,
    ref,
  ) => {
    const getContent = () => (
      <IconContainer
        $variant={variant}
        align="center"
        gap={3}
        justify="center"
        tag="span"
        visibility={loading ? 'hidden' : 'visible'}
      >
        {PrefixIcon && <PrefixIcon color={iconColor || undefined} />}
        <LabelContainer>{children}</LabelContainer>
      </IconContainer>
    );

    return (
      <ButtonContainer
        /** Do not change/remove these classes */
        {...props}
        className="fp-button fp-custom-appearance"
        data-full-width={fullWidth}
        data-loading={loading}
        data-size={size}
        data-testid={testID}
        data-variant={variant}
        disabled={disabled}
        form={form}
        ref={ref}
        size={size}
        tabIndex={0}
        type={type}
        $variant={variant}
      >
        {getContent()}
        <Box visibility={loading ? 'visible' : 'hidden'} position="absolute">
          <AnimatedLoadingSpinner
            animationStart={loading ?? false}
            ariaLabel={loadingAriaLabel}
            color={variant === 'primary' ? 'quinary' : 'tertiary'}
            size={size === 'large' ? 20 : 16}
          />
        </Box>
      </ButtonContainer>
    );
  },
);

const IconContainer = styled(Stack)<{
  $variant: ButtonVariant;
}>`
  ${({ theme, $variant }) => {
    const { button } = theme.components;

    return css`
      svg[data-colored='false'] {
        path {
          stroke: ${button.variant[$variant].color};
        }
        rect {
          stroke: ${button.variant[$variant].color};
        }
      }
    `;
  }}
`;

const ButtonContainer = styled.button<{
  size: ButtonSize;
  $variant: ButtonVariant;
}>`
  ${({ theme, $variant, size }) => {
    const { button } = theme.components;
    console.log(button);

    return css`
      ${createText(button.size[size].typography)}
      align-items: center;
      display: flex;
      justify-content: center;
      position: relative;
      user-select: none;
      cursor: pointer;
      outline-offset: ${theme.spacing[2]};
      background-color: ${button.variant[$variant].bg};
      color: ${button.variant[$variant].color};
      border-style: solid;
      border-width: ${button.borderWidth};
      border-color: ${button.variant[$variant].borderColor};
      border-radius: ${button.borderRadius};
      height: ${button.size[size].height};
      padding: 0 ${button.size[size].paddingHorizontal};
      box-shadow: ${button.variant[$variant].boxShadow};
      transition: ${button.transition};

      &:hover:enabled {
        background-color: ${button.variant[$variant].hover.bg};
        border-color: ${button.variant[$variant].hover.borderColor};
        color: ${button.variant[$variant].hover.color};
        box-shadow: ${button.variant[$variant].hover.boxShadow};
      }

      &:active:enabled {
        background-color: ${button.variant[$variant].active.bg};
        border-color: ${button.variant[$variant].active.borderColor};
        color: ${button.variant[$variant].active.color};
        box-shadow: ${button.variant[$variant].active.boxShadow};
      }

      &[data-loading='true'] {
        background-color: ${button.variant[$variant].loading.bg};
        color: ${button.variant[$variant].loading.color};
        pointer-events: none;

        path {
          fill: ${button.variant[$variant].loading.color};
        }
      }

      &:disabled {
        cursor: initial;
        background-color: ${button.variant[$variant].disabled.bg};
        border-color: ${button.variant[$variant].disabled.borderColor};
        color: ${button.variant[$variant].disabled.color};
        box-shadow: ${button.variant[$variant].disabled.boxShadow};

        path {
          fill: ${button.variant[$variant].disabled.color} !important;
        }
      }

      &[data-full-width='true'] {
        width: 100%;
      }
    `;
  }}
`;

const LabelContainer = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default Button;
