import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';

import { createFontStyles, createOverlayBackground } from '../../utils';
import Divider from '../divider';

const StyledDropdownTrigger = styled(RadixDropdown.Trigger)<{
  $asButton?: boolean;
}>`
  ${({ theme, $asButton }) => {
    const { button } = theme.components;

    if ($asButton) {
      return css`
        align-items: center;
        background-color: ${button.variant.secondary.bg};
        border-color: ${button.variant.secondary.borderColor};
        border-radius: ${button.borderRadius};
        border-style: solid;
        border-width: ${button.borderWidth};
        cursor: pointer;
        display: flex;
        height: 32px;
        padding: 0 ${theme.spacing[2]};
        user-select: none;

        &:hover:enabled {
          background-color: ${button.variant.secondary.hover.bg};
          border-color: ${button.variant.secondary.hover.borderColor};
          color: ${button.variant.secondary.hover.color};
        }

        &:active:enabled {
          background-color: ${button.variant.secondary.active.bg};
          border-color: ${button.variant.secondary.active.borderColor};
          color: ${button.variant.secondary.active.color};
        }

        &:disabled {
          cursor: initial;
          background-color: ${button.variant.secondary.disabled.bg};
          border-color: ${button.variant.secondary.disabled.borderColor};
          color: ${button.variant.secondary.disabled.color};

          path {
            fill: ${button.variant.secondary.disabled.color};
          }
        }
      `;
    }

    return css`
      align-items: center;
      background: none;
      border-radius: ${theme.borderRadius.full};
      border: none;
      cursor: pointer;
      display: flex;
      height: 24px;
      justify-content: center;
      margin: 0;
      padding: 0;
      width: 24px;

      &[data-state='open'] {
        background-color: ${theme.backgroundColor.senary};
      }

      &:enabled:hover {
        background-color: ${theme.backgroundColor.secondary};
      }

      &:disabled {
        cursor: initial;
        opacity: 0.5;
      }
    `;
  }}
`;

const StyledDropdownContent = styled(RadixDropdown.Content)<{
  $minWidth?: string;
}>`
  ${({ theme, $minWidth }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    min-width: ${$minWidth || '200px'};
    padding: ${theme.spacing[2]};
    z-index: ${theme.zIndex.dropdown};
  `}
`;

const StyledDropdownItem = styled(RadixDropdown.Item)<{
  variant?: 'default' | 'destructive';
  size?: 'default' | 'compact' | 'tiny';
}>`
  ${({ theme, variant, size }) => css`
    ${createFontStyles('body-3')};
    cursor: pointer;
    color: ${theme.color[variant === 'destructive' ? 'error' : 'primary']};
    padding: ${theme.spacing[2]} ${theme.spacing[5]};
    outline: none;
    border-radius: calc(${theme.borderRadius.default} - ${theme.spacing[2]});
    display: flex;
    align-items: center;
    justify-content: left;

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }

    &:focus {
      background-color: ${theme.backgroundColor.secondary};
    }

    &[data-disabled] {
      user-select: none;
      cursor: auto;
      color: ${theme.color.quaternary};

      &:hover {
        background: none;
      }
    }

    ${
      size === 'compact' &&
      css`
      padding: ${theme.spacing[2]} ${theme.spacing[3]};
      ${createFontStyles('caption-4')};
    `
    }

    ${
      size === 'tiny' &&
      css`
      padding: ${theme.spacing[2]} ${theme.spacing[2]} ${theme.spacing[2]}
        ${theme.spacing[3]};
      ${createFontStyles('caption-1')};
    `
    }
  `}
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin: ${theme.spacing[2]} 0;
  `}
`;

const StyledSubContent = styled(RadixDropdown.SubContent)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[3]};
    padding: ${theme.spacing[2]};
    z-index: ${theme.zIndex.dropdown};
  `}
`;

const StyledSubTrigger = styled(RadixDropdown.SubTrigger)<{
  variant?: 'default' | 'destructive';
  size?: 'default' | 'compact' | 'tiny';
}>`
  ${({ theme, variant, size }) => css`
    ${createFontStyles('body-3')};
    cursor: pointer;
    color: ${theme.color[variant === 'destructive' ? 'error' : 'primary']};
    padding: ${theme.spacing[2]} ${theme.spacing[5]};
    outline: none;
    border-radius: calc(${theme.borderRadius.default} - ${theme.spacing[2]});

    @media (hover: hover) {
      :hover {
        ${createOverlayBackground('darken-1', 'primary')};
      }
    }
    :focus {
      ${createOverlayBackground('darken-1', 'primary')};
    }

    &[data-disabled] {
      user-select: none;
      cursor: auto;
      color: ${theme.color.quaternary};

      &:hover {
        background: none;
      }
    }

    ${
      size === 'compact' &&
      css`
      padding: ${theme.spacing[2]} ${theme.spacing[3]};
      ${createFontStyles('caption-4')};
    `
    }

    ${
      size === 'tiny' &&
      css`
      padding: ${theme.spacing[2]} ${theme.spacing[2]} ${theme.spacing[2]}
        ${theme.spacing[3]};
      ${createFontStyles('caption-1')};
    `
    }
  `}
`;

const Dropdown = {
  Content: StyledDropdownContent,
  Trigger: StyledDropdownTrigger,
  Root: RadixDropdown.Root,
  Portal: RadixDropdown.Portal,
  Item: StyledDropdownItem,
  Divider: StyledDivider,
  Sub: RadixDropdown.Sub,
  SubTrigger: StyledSubTrigger,
  SubContent: StyledSubContent,
  Indicator: RadixDropdown.ItemIndicator,
};

export default Dropdown;
