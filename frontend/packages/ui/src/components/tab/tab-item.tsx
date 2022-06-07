import type { Icon } from 'icons';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

export type TabItemPros = {
  children: string;
  href?: string;
  iconComponent: Icon;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  selected?: boolean;
};

const TabItem = forwardRef<HTMLAnchorElement, TabItemPros>(
  (
    {
      children,
      href,
      iconComponent: IconComponent,
      onClick,
      selected = false,
    }: TabItemPros,
    ref,
  ) => (
    <Anchor
      aria-selected={selected}
      href={href}
      onClick={onClick}
      ref={ref}
      role="tab"
      selected={selected}
      tabIndex={0}
    >
      <IconComponent color={selected ? 'quinary' : 'primary'} />
      {children}
    </Anchor>
  ),
);

const Anchor = styled.a<{ selected: boolean }>`
  ${({ theme }) => {
    const font = theme.typography['label-4'];
    return css`
      // TODO: Define this on the design system level
      // https://linear.app/footprint/issue/FP-122/define-standards-for-transitions
      transition: 0.1s background-color;
      border-radius: ${theme.borderRadius[2]}px;
      color: ${theme.color.primary};
      cursor: pointer;
      display: flex;
      font-family: ${font.fontFamily};
      font-size: ${font.fontSize};
      font-weight: ${font.fontWeight};
      gap: ${theme.spacing[2]}px;
      justify-content: center;
      line-height: ${font.lineHeight};
      padding: ${theme.spacing[2]}px ${theme.spacing[4]}px;
      text-decoration: none;

      svg {
        position: relative;
        top: ${theme.spacing[1]}px;
      }
    `;
  }}

  ${({ theme, selected }) => {
    if (selected) {
      return css`
        color: ${theme.color.quinary};
        background-color: ${theme.backgroundColor.accent};
      `;
    }
    return css`
      &:hover {
        background-color: ${theme.overlay['darken-1']};
      }

      &:active {
        background-color: ${theme.overlay['darken-2']};
      }
    `;
  }}
`;

export default TabItem;
