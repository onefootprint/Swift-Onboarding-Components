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
}: LinkButtonProps) => {
  const renderedIcon = Icon && (
    <Icon color={variant === 'default' ? 'accent' : 'error'} />
  );
  return (
    <LinkButtonStyled
      variant={variant}
      aria-label={ariaLabel}
      data-testid={testID}
      href={href}
      onClick={onClick}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      size={size}
      tabIndex={0}
      target={href ? target : undefined}
      type={href ? undefined : 'button'}
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
};

export const LinkButtonStyled = styled.a.attrs<{
  href: string;
  size: LinkButtonSize;
  variant: LinkButtonVariant;
}>(({ href }) => ({
  as: href ? 'a' : 'button',
}))<LinkButtonStyleProps>`
  ${({ theme, size, href, variant }) => css`
    ${createFontStyles(fontSize[size])};
    align-items: center;
    background: transparent;
    border: none;
    color: ${theme.color[variant === 'default' ? 'accent' : 'error']};
    cursor: pointer;
    display: inline-flex;
    margin: 0;
    padding: 0;
    text-decoration: none;

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

    span + svg,
    svg + span {
      margin-left: ${theme.spacing[2]}px;
    }
  `}
`;

export default LinkButton;
