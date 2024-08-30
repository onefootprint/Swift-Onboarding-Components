import type React from 'react';
import styled, { css } from 'styled-components';

import { createText } from '../../../../utils';
import LoadingSpinner from '../../../loading-spinner';
import Stack from '../../../stack';
import type { ButtonSize, ButtonVariant } from '../../split-button.types';

type MainButtonProps = {
  children: React.ReactNode;
  disabled: boolean;
  loading?: boolean;
  loadingAriaLabel?: string;
  onClick?: () => void;
  ref?: React.Ref<HTMLButtonElement>;
  size?: ButtonSize;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
};

const MainButton = ({
  children,
  disabled,
  loading = false,
  loadingAriaLabel = 'Loading',
  onClick,
  ref,
  size,
  type = 'button',
  variant = 'secondary',
}: MainButtonProps) => (
  <Container
    /** Do not change/remove these classes */
    className="fp-button fp-custom-appearance"
    $loading={loading}
    $size={size ?? 'compact'}
    $variant={variant}
    data-loading={loading}
    disabled={disabled}
    onClick={onClick}
    ref={ref}
    tabIndex={0}
    type={type}
  >
    <Stack align="center" justify="center">
      {loading ? (
        <LoadingSpinner ariaLabel={loadingAriaLabel} color={variant === 'primary' ? 'quinary' : 'primary'} />
      ) : (
        <TextContent as="span">{children}</TextContent>
      )}
    </Stack>
  </Container>
);

const Container = styled.button<{
  $variant: ButtonVariant;
  $loading?: boolean;
  $size: ButtonSize;
}>`
  ${({ theme, $variant, $loading, $size }) => {
    const { button } = theme.components;

    return css`
      all: unset;
      --animation-duration: 0.1s;
      --adapted-border-radius: calc(${button.borderRadius} - 1px);
      ${createText(button.size[$size].typography)}
      background-color: ${button.variant[$variant].bg};
      border-radius: var(--adapted-border-radius) 0 0 var(--adapted-border-radius);
      color: ${button.variant[$variant].color};
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
      transition: all var(--animation-duration) ease-in-out;

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

      ${
        $loading &&
        css`
          background-color: ${button.variant[$variant].loading.bg};
          color: ${button.variant[$variant].loading.color};
          pointer-events: none;

          path {
            fill: ${button.variant[$variant].loading.color};
          }
        `
      }

      &:disabled {
        cursor: not-allowed;
        background-color: ${button.variant[$variant].disabled.bg};
        border-color: ${button.variant[$variant].disabled.borderColor};
        color: ${button.variant[$variant].disabled.color};

        path {
          fill: ${button.variant[$variant].disabled.color};
        }
      }

      &:[data-flat='true'] {
        box-shadow: none;
      }

      &:not([data-flat='true']) {
        box-shadow var(--animation-duration) ease-in-out;
        box-shadow: ${button.variant[$variant].boxShadow};
        clip-path: inset(-9999px 0 -9999px -9999px);

        &:hover {
          z-index: 0;
          box-shadow: ${button.variant[$variant].hover.boxShadow};
        }

        &:active {
          z-index: 0;
          box-shadow: ${button.variant[$variant].active.boxShadow};
        }

        &:disabled {
          box-shadow: ${button.variant[$variant].disabled.boxShadow};
        }
      }
    `;
  }}
`;

const TextContent = styled.span`
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default MainButton;
