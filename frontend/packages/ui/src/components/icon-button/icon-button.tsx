import { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { createOverlayBackground } from '../../utils/mixins';

export type IconButtonProps = {
  'aria-label': string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  testID?: string;
  width?: string;
  height?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { 'aria-label': ariaLabel, children, onClick, disabled, testID, width, height, variant = 'ghost' }: IconButtonProps,
    ref,
  ) => (
    <Container
      aria-label={ariaLabel}
      data-testid={testID}
      onClick={onClick}
      ref={ref}
      tabIndex={0}
      type="button"
      disabled={disabled}
      $width={width}
      $height={height}
      $variant={variant}
    >
      {children}
    </Container>
  ),
);

const Container = styled.button<{ $width?: string; $height?: string; $variant?: 'primary' | 'secondary' | 'ghost' }>`
  ${({ $width, $height, $variant, theme }) => {
    const { button } = theme.components;

    const getVariantStyles = () => {
      if ($variant === 'primary' || $variant === 'secondary') {
        return css`
          background-color: ${button.variant[$variant].bg};
          border: ${theme.borderWidth[1]} solid ${button.variant[$variant].borderColor};
          border-radius: ${theme.borderRadius.default};
          box-shadow: ${button.variant[$variant].boxShadow};
          svg {
            path {
              fill: ${button.variant[$variant].color};
            }
          }

          &:disabled {
            background-color: ${button.variant[$variant].disabled.bg};
            border: ${theme.borderWidth[1]} solid ${button.variant[$variant].disabled.borderColor};
            box-shadow: ${button.variant[$variant].disabled.boxShadow};
            svg {
              path {
                fill: ${button.variant[$variant].disabled.color};
              }
            }
          }

          &:hover:enabled {
            background-color: ${button.variant[$variant].hover.bg};
            border: ${theme.borderWidth[1]} solid ${button.variant[$variant].hover.borderColor};
            box-shadow: ${button.variant[$variant].hover.boxShadow};
            svg {
              path {
                fill: ${button.variant[$variant].hover.color};
              }
            }
          }

          &:active:enabled { 
            background-color: ${button.variant[$variant].active.bg};
            border: ${theme.borderWidth[1]} solid ${button.variant[$variant].active.borderColor};
            svg {
              path {
                fill: ${button.variant[$variant].active.color};
              }
            }
          }
        `;
      }

      return css`
        background: none;
        border: none;
        border-radius: ${theme.borderRadius.default};

        &:disabled {
          cursor: initial;
          opacity: 0.5;
        }

        &:hover:enabled {
          ${createOverlayBackground('darken-1', 'primary')};
        }

        &:active:enabled {
          ${createOverlayBackground('darken-2', 'primary')};
        }
      `;
    };

    return css`
      all: unset;
      align-items: center;
      cursor: pointer;
      display: flex;
      justify-content: center;
      height: ${$height || '32px'};
      width: ${$width || '32px'};

      ${getVariantStyles()}
    `;
  }}
`;

export default IconButton;
