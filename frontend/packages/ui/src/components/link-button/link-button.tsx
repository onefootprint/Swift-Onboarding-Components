import type { Icon } from 'icons';
import React, { HTMLAttributeAnchorTarget } from 'react';
import styled, { css } from 'styled-components';

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
};

const LinkButton = ({
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
}: LinkButtonProps) => {
  const renderedIcon = Icon && (
    <Icon color={variant === 'default' ? 'accent' : 'error'} />
  );
  return (
    <LinkButtonStyled
      variant={variant}
      disabled={disabled}
      aria-label={ariaLabel}
      data-testid={testID}
      href={!disabled ? href : undefined}
      onClick={!disabled ? onClick : undefined}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      size={size}
      tabIndex={0}
      target={href && !disabled ? target : undefined}
      type={href && !disabled ? undefined : 'button'}
    >
      {iconPosition === 'left' && renderedIcon}
      <span>{children}</span>
      {iconPosition === 'right' && renderedIcon}
    </LinkButtonStyled>
  );
};

type LinkButtonStyleProps = Pick<LinkButtonProps, 'href'> & {
  size: LinkButtonSize;
  variant: LinkButtonVariant;
  disabled: boolean;
};

export const LinkButtonStyled = styled.a.attrs<{
  href: string;
  size: LinkButtonSize;
  variant: LinkButtonVariant;
  disabled: boolean;
}>(({ href }) => ({
  as: href ? 'a' : 'button',
}))<LinkButtonStyleProps>`
  ${({ theme, size, href, variant, disabled }) => css`
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

    span + svg,
    svg + span {
      margin-left: ${theme.spacing[2]}px;
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
