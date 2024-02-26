import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../../utils';
import AnimatedLoadingSpinner from '../../../animated-loading-spinner';
import Stack from '../../../stack';
import type { ButtonVariant } from '../../split-button.types';

type MainButtonProps = {
  loading?: boolean;
  disabled: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  loadingAriaLabel?: string;
  children: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
  flat?: boolean;
};

const MainButton = ({
  loading = false,
  disabled,
  onClick,
  type = 'button',
  variant = 'secondary',
  loadingAriaLabel = 'Loading',
  children,
  flat,
  ref,
}: MainButtonProps) => (
  <Container
    /** Do not change/remove these classes */
    className="fp-button fp-custom-appearance"
    data-loading={loading}
    disabled={disabled}
    onClick={onClick}
    ref={ref}
    tabIndex={0}
    type={type}
    variant={variant}
    data-flat={flat}
  >
    <Stack align="center" justify="center">
      {loading ? (
        <AnimatedLoadingSpinner
          ariaLabel={loadingAriaLabel}
          color={variant === 'primary' ? 'quinary' : 'primary'}
          animationStart
        />
      ) : (
        <Stack as="span" whiteSpace="nowrap">
          {children}
        </Stack>
      )}
    </Stack>
  </Container>
);

const Container = styled.button<{ variant: ButtonVariant; loading?: boolean }>`
  ${({ theme, variant, loading }) => {
    const { button } = theme.components;

    return css`
      all: unset;
      --animation-duration: 0.1s;
      ${createFontStyles('label-4')}
      background-color: ${button.variant[variant].bg};
      border-color: ${button.variant[variant].borderColor};
      border-radius: ${button.borderRadius} 0 0 ${button.borderRadius};
      border-style: solid;
      border-width: ${button.borderWidth};
      border-right: none;
      color: ${button.variant[variant].color};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      height: 100%;
      outline-offset: ${theme.spacing[2]};
      padding: 0 ${theme.spacing[4]};
      position: relative;
      user-select: none;
      width: fit-content;
      z-index: 1;
      transition: all 0.2s ease-in-out;

      &:hover:enabled {
        background-color: ${button.variant[variant].hover.bg};
        border-color: ${button.variant[variant].hover.borderColor};
        color: ${button.variant[variant].hover.color};
        box-shadow: ${button.variant[variant].hover.boxShadow};
      }

      &:active:enabled {
        background-color: ${button.variant[variant].active.bg};
        border-color: ${button.variant[variant].active.borderColor};
        color: ${button.variant[variant].active.color};
        box-shadow: ${button.variant[variant].active.boxShadow};
      }

      ${
        loading &&
        css`
          background-color: ${button.variant[variant].loading.bg};
          color: ${button.variant[variant].loading.color};
          pointer-events: none;

          path {
            fill: ${button.variant[variant].loading.color};
          }
        `
      }

      &:disabled {
        cursor: not-allowed;
        background-color: ${button.variant[variant].disabled.bg};
        border-color: ${button.variant[variant].disabled.borderColor};
        color: ${button.variant[variant].disabled.color};

        path {
          fill: ${button.variant[variant].disabled.color};
        }
      }

      &:[data-flat='true'] {
        box-shadow: none;
      }

      &:not([data-flat='true']) {
        box-shadow var(--animation-duration) ease-in-out;
        box-shadow: ${button.variant[variant].boxShadow};
        clip-path: inset(-9999px 0 -9999px -9999px);

        &:hover {
          z-index: 0;
          box-shadow: ${button.variant[variant].hover.boxShadow};
        }

        &:active {
          z-index: 0;
          box-shadow: ${button.variant[variant].active.boxShadow};
        }

        &:disabled {
          box-shadow: ${button.variant[variant].disabled.boxShadow};
        }
      }
    `;
  }}
`;

export default MainButton;
