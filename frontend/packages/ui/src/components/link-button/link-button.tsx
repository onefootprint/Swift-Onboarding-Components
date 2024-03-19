import type { Icon } from '@onefootprint/icons';
import type { HTMLAttributeAnchorTarget } from 'react';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import type { BoxProps } from '../box';
import Box from '../box';
import type { LinkButtonVariant } from './link-button.types';

type IconPosition = 'left' | 'right';

export type LinkButtonProps = BoxProps & {
  ariaLabel?: string;
  children: string;
  href?: string;
  iconComponent?: Icon;
  iconPosition?: IconPosition;
  onClick?: (
    event:
      | React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
      | React.KeyboardEvent<HTMLButtonElement | HTMLAnchorElement>
      | MouseEvent,
  ) => void;
  target?: HTMLAttributeAnchorTarget;
  testID?: string;
  variant?: LinkButtonVariant;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  destructive?: boolean;
  className?: string;
};

type LinkButtonStyleProps = Pick<LinkButtonProps, 'href'> & {
  variant: LinkButtonVariant;
  disabled: boolean;
  destructive?: boolean;
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
      target,
      testID,
      type = 'button',
      variant = 'label-3',
      destructive,
      className,
    }: LinkButtonProps,
    ref,
  ) => {
    const renderedIcon = Icon && (
      <Icon color={!destructive ? 'accent' : 'error'} />
    );
    return (
      <LinkButtonStyled
        as={href ? 'a' : 'button'}
        aria-label={ariaLabel}
        /** Do not change/remove these classes */
        className={`fp-link-button fp-custom-appearance ${className}`}
        data-icon-position={iconPosition}
        data-testid={testID}
        data-variant={variant}
        disabled={disabled}
        href={!disabled ? href : undefined}
        onClick={!disabled ? onClick : undefined}
        ref={ref}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        target={target}
        type={href ? undefined : type}
        variant={variant}
        // TODO: https://linear.app/footprint/issue/FP-1479/split-linkbutton-and-link-component
        // @ts-ignore
        form={href ? undefined : form}
        destructive={destructive}
      >
        {iconPosition === 'left' && renderedIcon}
        {children}
        {iconPosition === 'right' && renderedIcon}
      </LinkButtonStyled>
    );
  },
);

export const LinkButtonStyled = styled(Box)<LinkButtonStyleProps>`
  ${({ theme, destructive, variant, disabled }) => {
    const {
      components: { linkButton },
    } = theme;

    const styleVariant = destructive ? 'destructive' : 'default';
    const smallSizes = ['snippet-2', 'snippet-3'];

    return css`
      ${createFontStyles(variant)}
      align-items: center;
      background: transparent;
      border: none;
      color: ${linkButton[styleVariant].color.text.initial};
      cursor: ${disabled ? 'initial' : 'pointer'};
      display: inline-flex;
      margin: 0;
      padding: 0;
      text-decoration: none;
      width: fit-content;
      gap: ${smallSizes.includes(variant)
        ? theme.spacing[1]
        : theme.spacing[2]};

      &:hover,
      &:hover path {
        color: ${linkButton[styleVariant].color.text.hover};
        fill: ${linkButton[styleVariant].color.text.hover};
      }

      &:active,
      &:active path {
        color: ${linkButton[styleVariant].color.text.active};
        fill: ${linkButton[styleVariant].color.text.active};
      }

      &:disabled,
      &:disabled path {
        color: ${linkButton[styleVariant].color.text.disabled};
        fill: ${linkButton[styleVariant].color.text.disabled};
      }
    `;
  }}
`;

export default LinkButton;
