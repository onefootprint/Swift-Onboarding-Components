import type { Icon as TIcon } from 'icons';
import React, { HTMLAttributeAnchorTarget } from 'react';
import styled, { css } from 'styled';

import fontSize from './link-button.constants';
import type { LinkButtonSize } from './link-button.types';

export type LinkButtonProps = {
  ariaLabel?: string;
  children: string;
  href?: string;
  Icon?: TIcon;
  iconPosition?: 'left' | 'right';
  onPress?: (
    event:
      | React.KeyboardEvent<HTMLAnchorElement>
      | React.KeyboardEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement>
      | React.MouseEvent<HTMLAnchorElement>,
  ) => void;
  size?: LinkButtonSize;
  target?: HTMLAttributeAnchorTarget;
  testID?: string;
};

const LinkButton = ({
  ariaLabel,
  children,
  href,
  Icon,
  iconPosition = 'right',
  onPress,
  size = 'default',
  target,
  testID,
}: LinkButtonProps) => {
  const renderedIcon = Icon && <Icon color="accent" />;
  return (
    <LinkButtonStyled
      aria-label={ariaLabel}
      data-testid={testID}
      href={href}
      onClick={onPress}
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
};

export const LinkButtonStyled = styled.a.attrs<{
  href: string;
  size: LinkButtonSize;
}>(({ href }) => ({
  as: href ? 'a' : 'button',
}))<LinkButtonStyleProps>`
  ${({ theme, size }) => css`
    align-items: center;
    background: transparent;
    border: none;
    color: ${theme.color.accent};
    cursor: pointer;
    display: flex;
    font-family: ${theme.typography[fontSize[size]].fontFamily};
    font-size: ${theme.typography[fontSize[size]].fontSize};
    font-weight: ${theme.typography[fontSize[size]].fontWeight};
    line-height: ${theme.typography[fontSize[size]].lineHeight};

    span + svg,
    svg + span {
      margin-left: ${theme.spacing[2]}px;
    }
  `}
`;

export default LinkButton;
