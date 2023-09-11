import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { HTMLAttributeAnchorTarget } from 'react';
import React, { forwardRef } from 'react';

import type { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import useSX from '../../hooks/use-sx';
import { createTypography } from '../../utils/mixins';
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
        aria-label={ariaLabel}
        /** Do not change/remove these classes */
        className="fp-link-button fp-custom-appearance"
        data-icon-position={iconPosition}
        data-size={size}
        data-testid={testID}
        data-variant={variant}
        disabled={disabled}
        href={!disabled ? href : undefined}
        onClick={!disabled ? onClick : undefined}
        ref={ref}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        size={size}
        sx={sxStyles}
        target={target}
        type={href ? undefined : type}
        variant={variant}
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
  ${({ theme, size, variant, disabled, sx }) => {
    const {
      components: { linkButton },
    } = theme;

    return css`
      ${createTypography(linkButton.size[size].typography)}
      align-items: center;
      background: transparent;
      border: none;
      color: ${linkButton.variant[variant].color.text.initial};
      cursor: ${disabled ? 'initial' : 'pointer'};
      display: inline-flex;
      height: ${linkButton.size[size].height};
      margin: 0;
      padding: 0;
      text-decoration: none;
      ${sx};

      &:hover,
      &:hover path {
        color: ${linkButton.variant[variant].color.text.hover};
        fill: ${linkButton.variant[variant].color.text.hover};
      }

      &:active,
      &:active path {
        color: ${linkButton.variant[variant].color.text.active};
        fill: ${linkButton.variant[variant].color.text.active};
      }

      &:disabled,
      &:disabled path {
        color: ${linkButton.variant[variant].color.text.disabled};
        fill: ${linkButton.variant[variant].color.text.disabled};
      }

      &[data-icon-position='left'] svg {
        margin-right: ${theme.spacing[2]};
      }

      &[data-icon-position='right'] svg {
        margin-left: ${theme.spacing[2]};
      }
    `;
  }}
`;

export default LinkButton;
