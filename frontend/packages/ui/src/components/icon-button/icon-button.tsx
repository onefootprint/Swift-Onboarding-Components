import { forwardRef } from 'react';
import styled, { css } from 'styled-components';

export type IconButtonSize = 'default' | 'large' | 'compact' | 'tiny';

export const iconButtonSizes: Record<IconButtonSize, string> = {
  large: '40px',
  default: '32px',
  compact: '28px',
  tiny: '24px',
};

export type IconButtonProps = {
  'aria-label': string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: IconButtonSize;
  testID?: string;
  variant?: 'outline' | 'ghost';
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      'aria-label': ariaLabel,
      children,
      onClick,
      size = 'default',
      testID,
      variant = 'ghost',
      ...props
    }: IconButtonProps,
    ref,
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onClick?.(event);
    };

    return (
      <Container
        $size={size}
        $variant={variant}
        aria-label={ariaLabel}
        data-testid={testID}
        onClick={handleClick}
        ref={ref}
        tabIndex={0}
        type="button"
        {...props}
      >
        {children}
      </Container>
    );
  },
);

const Container = styled.button<{ $size: IconButtonSize; $variant?: 'outline' | 'ghost' }>`
  ${({ $size, $variant, theme }) => {
    const { button } = theme.components;

    const getVariantStyles = () => {
      const buttonSize = css`
        height: ${iconButtonSizes[$size]};
        width: ${iconButtonSizes[$size]};
      `;

      if ($variant === 'outline') {
        return css`
          ${buttonSize}
          background-color: ${button.variant.secondary.bg};
          border: ${theme.borderWidth[1]} solid ${button.variant.secondary.borderColor};
          border-radius: ${$size === 'tiny' ? theme.borderRadius.sm : theme.borderRadius.default};
          box-shadow: ${button.variant.secondary.boxShadow};
          svg {
            path {
              fill: ${button.variant.secondary.color};
            }
          }

          &:disabled {
            background-color: ${button.variant.secondary.disabled.bg};
            border: ${theme.borderWidth[1]} solid ${button.variant.secondary.disabled.borderColor};
            box-shadow: ${button.variant.secondary.disabled.boxShadow};
            svg {
              path {
                fill: ${button.variant.secondary.disabled.color};
              }
            }
          }

          &:hover:enabled {
            background-color: ${button.variant.secondary.hover.bg};
            border: ${theme.borderWidth[1]} solid ${button.variant.secondary.hover.borderColor};
            box-shadow: ${button.variant.secondary.hover.boxShadow};
            svg {
              path {
                fill: ${button.variant.secondary.hover.color};
              }
            }
          }

          &:active:enabled { 
            background-color: ${button.variant.secondary.active.bg};
            border: ${theme.borderWidth[1]} solid ${button.variant.secondary.active.borderColor};
            svg {
              path {
                fill: ${button.variant.secondary.active.color};
              }
            }
          }
        `;
      }

      return css`
        ${buttonSize}
        background: none;
        border: none;
        border-radius: ${$size === 'tiny' ? theme.borderRadius.sm : theme.borderRadius.default};

        &:disabled {
          cursor: initial;
          opacity: 0.5;
        }

        &:hover:enabled {
          background-color: ${theme.backgroundColor.secondary};
        }

        &:active:enabled {
            background-color: ${theme.backgroundColor.secondary};
        }
      `;
    };

    return css`
      all: unset;
      align-items: center;
      cursor: pointer;
      display: flex;
      justify-content: center;
      box-sizing: border-box;

      ${getVariantStyles()}
    `;
  }}
`;

export default IconButton;
