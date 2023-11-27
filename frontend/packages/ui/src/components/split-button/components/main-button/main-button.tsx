import styled, { css } from '@onefootprint/styled';
import React, { useEffect, useRef, useState } from 'react';

import { createFontStyles } from '../../../../utils';
import LoadingIndicator from '../../../loading-indicator';
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
};

const MainButton = ({
  loading = false,
  disabled,
  onClick,
  type = 'button',
  variant = 'primary',
  loadingAriaLabel = 'Loading',
  children,
  ref,
}: MainButtonProps) => {
  const [contentWidth, setContentWidth] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (contentRef.current) {
      setContentWidth(contentRef.current.getBoundingClientRect().width);
    }
  }, [contentRef]);

  return (
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
    >
      <Stack width={`${contentWidth}px`} align="center" justify="center">
        {loading ? (
          <LoadingIndicator
            aria-label={loadingAriaLabel}
            color={variant === 'primary' ? 'quinary' : 'primary'}
          />
        ) : (
          <Stack as="span" whiteSpace="nowrap" ref={contentRef}>
            {children}
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

const Container = styled.button<{
  variant: ButtonVariant;
  loading?: boolean;
}>`
  ${({ theme, variant, loading }) => {
    const { button } = theme.components;

    return css`
      all: unset;
      ${createFontStyles('label-4')}
      background-color: ${button.variant[variant].bg};
      border-color: ${button.variant[variant].borderColor};
      border-radius: ${button.borderRadius} 0 0 ${button.borderRadius};
      border-style: solid;
      border-width: ${button.borderWidth} 0 ${button.borderWidth}
        ${button.borderWidth};
      border-right: 0;
      color: ${button.variant[variant].color};
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      height: 100%;
      justify-content: center;
      outline-offset: ${theme.spacing[2]};
      padding: 0 ${theme.spacing[4]};
      position: relative;
      user-select: none;
      width: fit-content;

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

      ${loading &&
      css`
        background-color: ${button.variant[variant].loading.bg};
        color: ${button.variant[variant].loading.color};
        pointer-event: none;

        path {
          fill: ${button.variant[variant].loading.color};
        }
      `}

      &:disabled {
        cursor: initial;
        background-color: ${button.variant[variant].disabled.bg};
        border-color: ${button.variant[variant].disabled.borderColor};
        color: ${button.variant[variant].disabled.color};

        path {
          fill: ${button.variant[variant].disabled.color};
        }
      }
    `;
  }}
`;

export default MainButton;
