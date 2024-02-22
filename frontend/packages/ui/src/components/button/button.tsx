/* eslint-disable react/jsx-props-no-spreading */
import type { Color } from '@onefootprint/design-tokens';
import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { ButtonHTMLAttributes } from 'react';
import React, { forwardRef } from 'react';

import type { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import useSX from '../../hooks/use-sx';
import { createTypography } from '../../utils/mixins';
import Box from '../box';
import LoadingIndicator from '../loading-indicator';
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
  sx?: SXStyleProps;
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
      sx,
      prefixIcon: PrefixIcon,
      iconColor,
      ...props
    }: ButtonProps,
    ref,
  ) => {
    const sxStyles = useSX(sx);

    const getContent = () => (
      <IconContainer
        as="span"
        justify="center"
        align="center"
        gap={3}
        visibility={loading ? 'hidden' : 'visible'}
        $variant={variant}
      >
        {PrefixIcon && <PrefixIcon color={iconColor || undefined} />}
        <LabelContainer>{children}</LabelContainer>
      </IconContainer>
    );

    return (
      <ButtonContainer
        /** Do not change/remove these classes */
        {...props}
        $size={size}
        $sx={sxStyles}
        $variant={variant}
        className="fp-button fp-custom-appearance"
        data-full-width={fullWidth}
        data-loading={loading}
        data-size={size}
        data-testid={testID}
        data-variant={variant}
        disabled={disabled}
        form={form}
        ref={ref}
        tabIndex={0}
        type={type}
      >
        {getContent()}
        <Box visibility={loading ? 'visible' : 'hidden'} position="absolute">
          <LoadingIndicator
            aria-label={loadingAriaLabel}
            color={variant === 'primary' ? 'quinary' : 'primary'}
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
  $size: ButtonSize;
  $variant: ButtonVariant;
  $sx?: SXStyles;
}>`
  ${({ theme, $variant, $size, $sx }) => {
    const { button } = theme.components;

    return css`
      ${createTypography(button.size[$size].typography)}
      align-items: center;
      background-color: ${button.variant[$variant].bg};
      border-color: ${button.variant[$variant].borderColor};
      border-radius: ${button.borderRadius};
      border-style: solid;
      border-width: ${button.borderWidth};
      color: ${button.variant[$variant].color};
      cursor: pointer;
      display: flex;
      height: ${button.size[$size].height};
      justify-content: center;
      outline-offset: ${theme.spacing[2]};
      padding: 0 ${button.size[$size].paddingHorizontal};
      position: relative;
      user-select: none;
      ${$sx};

      @media (hover: hover) {
        &:hover:enabled {
          background-color: ${button.variant[$variant].hover.bg};
          border-color: ${button.variant[$variant].hover.borderColor};
          color: ${button.variant[$variant].hover.color};
        }
      }

      &:active:enabled {
        background-color: ${button.variant[$variant].active.bg};
        border-color: ${button.variant[$variant].active.borderColor};
        color: ${button.variant[$variant].active.color};
      }

      &[data-loading='true'] {
        background-color: ${button.variant[$variant].loading.bg};
        color: ${button.variant[$variant].loading.color};
        pointer-event: none;

        path {
          fill: ${button.variant[$variant].loading.color};
        }
      }

      &:disabled {
        cursor: initial;
        background-color: ${button.variant[$variant].disabled.bg};
        border-color: ${button.variant[$variant].disabled.borderColor};
        color: ${button.variant[$variant].disabled.color};

        path {
          fill: ${button.variant[$variant].disabled.color};
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
