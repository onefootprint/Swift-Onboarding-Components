import type { Icon } from '@onefootprint/icons';
import React, { forwardRef, HTMLAttributeAnchorTarget } from 'react';
import styled, { css } from 'styled-components';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import { createFontStyles } from '../../utils/mixins';
import { fontSize } from './link-button.constants';
import type { LinkButtonSize, LinkButtonVariant } from './link-button.types';

type IconPosition = 'left' | 'right';

export type LinkButtonProps = {
  ariaLabel?: string;
  children: string;
  href?: string;
  iconComponent?: Icon;
  iconPosition?: IconPosition;
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
  type?: 'button' | 'submit' | 'reset';
  form?: string;
};

const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      ariaLabel,
      children,
      disabled = false,
      form,
      href,
      iconComponent: Icon,
      iconPosition = 'right',
      onClick,
      size = 'default',
      sx,
      target,
      testID,
      type = 'button',
      variant = 'default',
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
        iconPosition={iconPosition}
        type={href ? undefined : type}
        // TODO: https://linear.app/footprint/issue/FP-1479/split-linkbutton-and-link-component
        // @ts-ignore
        form={href ? undefined : form}
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
  iconPosition: IconPosition;
};

export const LinkButtonStyled = styled.a.attrs<{
  href: string;
  size: LinkButtonSize;
  variant: LinkButtonVariant;
  disabled: boolean;
  sx: SXStyles;
  iconPosition: IconPosition;
}>(({ href }) => ({
  as: href ? 'a' : 'button',
}))<LinkButtonStyleProps>`
  ${({ theme, size, variant, disabled, sx, iconPosition }) => css`
    ${createFontStyles(fontSize[size])};
    align-items: center;
    background: transparent;
    border: none;
    color: ${theme.color[variant === 'default' ? 'accent' : 'error']};
    cursor: ${disabled ? 'auto' : 'pointer'};
    display: inline-flex;
    margin: 0;
    padding: 0;
    text-decoration: none;
    ${sx};

    &:hover {
      opacity: 0.7;
    }

    &:active {
      opacity: 0.85;
    }

    &:disabled {
      opacity: 0.45;
    }

    svg {
      ${iconPosition === 'left'
        ? css`
            margin-right: ${theme.spacing[2]}px;
          `
        : css`
            margin-left: ${theme.spacing[2]}px;
          `}
    }
  `}
`;

export default LinkButton;
