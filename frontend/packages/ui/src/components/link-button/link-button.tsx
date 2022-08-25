import type { Icon } from 'icons';
import React, { forwardRef, HTMLAttributeAnchorTarget } from 'react';
import styled, { css } from 'styled-components';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import { createFontStyles } from '../../utils/mixins';
import { fontSize } from './link-button.constants';
import type { LinkButtonSize, LinkButtonVariant } from './link-button.types';

export type LinkButtonProps = {
  ariaLabel?: string;
  children: string;
  href?: string;
  iconComponent?: Icon;
  iconPosition?: 'left' | 'right';
  onClick?: (
    event:
      | React.KeyboardEvent<HTMLAnchorElement>
      | React.KeyboardEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement>
      | React.MouseEvent<HTMLAnchorElement>,
  ) => void;
  size?: LinkButtonSize;
  target?: HTMLAttributeAnchorTarget;
  testID?: string;
  variant?: LinkButtonVariant;
  disabled?: boolean;
  sx?: SXStyleProps;
};

const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      ariaLabel,
      children,
      href,
      iconComponent: Icon,
      iconPosition = 'right',
      onClick,
      size = 'default',
      target,
      testID,
      variant = 'default',
      disabled = false,
      sx,
    }: LinkButtonProps,
    ref,
  ) => {
    const sxStyles = useSX(sx);
    const renderedIcon = Icon && (
      <Icon color={variant === 'default' ? 'accent' : 'error'} />
    );
    return (
      <LinkButtonStyled
        size={size}
        ref={ref}
        variant={variant}
        disabled={disabled}
        aria-label={ariaLabel}
        data-testid={testID}
        href={!disabled ? href : undefined}
        onClick={!disabled ? onClick : undefined}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        sx={sxStyles}
      >
        {iconPosition === 'left' && renderedIcon}
        {children}
        {iconPosition === 'right' && renderedIcon}
      </LinkButtonStyled>
    );
  },
);

type LinkButtonStyleProps = Pick<LinkButtonProps, 'href'> & {
  size: LinkButtonSize;
  variant: LinkButtonVariant;
  disabled: boolean;
  sx?: SXStyles;
};

export const LinkButtonStyled = styled.a.attrs<{
  href: string;
  size: LinkButtonSize;
  variant: LinkButtonVariant;
  disabled: boolean;
  sx: SXStyles;
}>(({ href }) => ({
  as: href ? 'a' : 'button',
}))<LinkButtonStyleProps>`
  ${({ theme, size, href, variant, disabled, sx }) => css`
    ${createFontStyles(fontSize[size])};
    align-items: center;
    background: transparent;
    border: none;
    color: ${theme.color[variant === 'default' ? 'accent' : 'error']};
    cursor: ${disabled ? 'auto' : 'cursor'};
    display: inline-flex;
    margin: 0;
    padding: 0;
    text-decoration: none;
    ${sx};

    svg {
      &:last-child {
        margin-left: ${theme.spacing[2]}px;
      }

      &:first-child {
        margin-right: ${theme.spacing[2]}px;
      }
    }

    ${disabled
      ? 'opacity: 0.45'
      : css`
          &:hover {
            opacity: 0.7;

            ${href &&
            css`
              text-decoration: underline;
            `};
          }

          &:active {
            opacity: 0.85;
          }
        `}
  `}
`;

export default LinkButton;
