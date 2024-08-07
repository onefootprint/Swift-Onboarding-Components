/* eslint-disable react/jsx-props-no-spreading */
import type { Theme } from '@onefootprint/design-tokens';
import type { Icon } from '@onefootprint/icons';
import type { HTMLAttributeAnchorTarget } from 'react';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import type { LinkButtonVariant } from './link-button.types';

type IconPosition = 'left' | 'right';

export type LinkButtonProps = {
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
  $margin?: keyof Theme['spacing'];
  $marginInline?: keyof Theme['spacing'];
  $marginBlock?: keyof Theme['spacing'];
  $marginBottom?: keyof Theme['spacing'];
  $marginLeft?: keyof Theme['spacing'];
  $marginRight?: keyof Theme['spacing'];
  $marginTop?: keyof Theme['spacing'];
  $padding?: keyof Theme['spacing'];
  $paddingBottom?: keyof Theme['spacing'];
  $paddingLeft?: keyof Theme['spacing'];
  $paddingRight?: keyof Theme['spacing'];
  $paddingTop?: keyof Theme['spacing'];
  $paddingInline?: keyof Theme['spacing'];
  $paddingBlock?: keyof Theme['spacing'];
};

type StyledProps = Omit<LinkButtonProps, 'variant' | 'destructive'> & {
  $variant?: LinkButtonVariant;
  $destructive?: boolean;
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
      $margin,
      $marginInline,
      $marginBlock,
      $marginBottom,
      $marginLeft,
      $marginRight,
      $marginTop,
      $padding,
      $paddingBottom,
      $paddingLeft,
      $paddingRight,
      $paddingTop,
      $paddingInline,
      $paddingBlock,
      ...props
    }: LinkButtonProps,
    ref,
  ) => {
    const renderedIcon = Icon && <Icon color={!destructive ? 'accent' : 'error'} />;
    // TODO: https://linear.app/footprint/issue/FP-1479/split-linkbutton-and-link-component
    // @ts-ignore
    return (
      <LinkButtonStyled
        {...props}
        /** Do not change/remove these classes */
        className="fp-link-button fp-custom-appearance"
        role={href ? 'link' : 'button'}
        as={href ? 'a' : 'button'}
        aria-label={ariaLabel}
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
        $variant={variant}
        form={href ? undefined : form}
        $destructive={destructive}
        $margin={$margin}
        $marginInline={$marginInline}
        $marginBlock={$marginBlock}
        $marginBottom={$marginBottom}
        $marginLeft={$marginLeft}
        $marginRight={$marginRight}
        $marginTop={$marginTop}
        $padding={$padding}
        $paddingBottom={$paddingBottom}
        $paddingLeft={$paddingLeft}
        $paddingRight={$paddingRight}
        $paddingTop={$paddingTop}
        $paddingInline={$paddingInline}
        $paddingBlock={$paddingBlock}
      >
        {iconPosition === 'left' && renderedIcon}
        {children}
        {iconPosition === 'right' && renderedIcon}
      </LinkButtonStyled>
    );
  },
);

export const LinkButtonStyled = styled.button<StyledProps>`
  ${({
    theme,
    $destructive,
    $variant = 'label-3',
    disabled,
    $margin,
    $marginInline,
    $marginBlock,
    $marginBottom,
    $marginLeft,
    $marginRight,
    $marginTop,
    $padding,
    $paddingBottom,
    $paddingLeft,
    $paddingRight,
    $paddingTop,
    $paddingInline,
    $paddingBlock,
  }) => {
    const {
      components: { linkButton },
    } = theme;

    const styleVariant = $destructive ? 'destructive' : 'default';
    const smallSizes = ['snippet-2', 'snippet-3'];

    return css`
      ${createFontStyles($variant)}
      margin: ${$margin ? theme.spacing[$margin] : '0'};
      margin-inline: ${$marginInline ? theme.spacing[$marginInline] : undefined};
      margin-block: ${$marginBlock ? theme.spacing[$marginBlock] : undefined};
      margin-bottom: ${$marginBottom ? theme.spacing[$marginBottom] : undefined};
      margin-left: ${$marginLeft ? theme.spacing[$marginLeft] : undefined};
      margin-right: ${$marginRight ? theme.spacing[$marginRight] : undefined};
      margin-top: ${$marginTop ? theme.spacing[$marginTop] : undefined};
      padding: ${$padding ? theme.spacing[$padding] : '0'};
      padding-bottom: ${$paddingBottom ? theme.spacing[$paddingBottom] : undefined};
      padding-left: ${$paddingLeft ? theme.spacing[$paddingLeft] : undefined};
      padding-right: ${$paddingRight ? theme.spacing[$paddingRight] : undefined};
      padding-top: ${$paddingTop ? theme.spacing[$paddingTop] : undefined};
      padding-inline: ${$paddingInline ? theme.spacing[$paddingInline] : undefined};
      padding-block: ${$paddingBlock ? theme.spacing[$paddingBlock] : undefined};
      align-items: center;
      background: transparent;
      border: none;
      color: ${linkButton[styleVariant].color.text.initial};
      cursor: ${disabled ? 'initial' : 'pointer'};
      display: inline-flex;
      text-decoration: none;
      width: fit-content;
      gap: ${smallSizes.includes($variant) ? theme.spacing[1] : theme.spacing[2]};
      stroke: ${linkButton[styleVariant].color.text.initial};
      fill: ${linkButton[styleVariant].color.text.initial};
      stroke: ${linkButton[styleVariant].color.text.initial};

      svg {
        path {
          color: ${linkButton[styleVariant].color.text.initial};
          fill: ${linkButton[styleVariant].color.text.initial};
          stroke: ${linkButton[styleVariant].color.text.initial};
        }
      }

      &:hover,
      &:hover svg path {
        color: ${linkButton[styleVariant].color.text.hover};
        fill: ${linkButton[styleVariant].color.text.hover};
        stroke: ${linkButton[styleVariant].color.text.hover};
      }

      &:active,
      &:active svg path {
        color: ${linkButton[styleVariant].color.text.active};
        fill: ${linkButton[styleVariant].color.text.active};
        stroke: ${linkButton[styleVariant].color.text.active};
      }

      &:disabled,
      &:disabled svg path {
        color: ${linkButton[styleVariant].color.text.disabled};
        fill: ${linkButton[styleVariant].color.text.disabled};
        stroke: ${linkButton[styleVariant].color.text.disabled};
      }
    `;
  }}
`;

export default LinkButton;
