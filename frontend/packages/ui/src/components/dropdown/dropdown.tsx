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
        border-radius: ${theme.borderRadius.sm};
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
      border-radius: ${theme.borderRadius.sm};
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
  $noPadding?: boolean;
}>`
  ${({ theme, $minWidth, $noPadding }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    min-width: ${$minWidth || '200px'};
    z-index: ${theme.zIndex.dropdown};
    padding: ${$noPadding ? 0 : theme.spacing[2]};
  `}
`;

const StyledDropdownItem = styled(RadixDropdown.Item)<{
  variant?: 'default' | 'destructive';
  size?: 'default' | 'compact' | 'tiny';
}>`
  ${({ theme, variant, size }) => css`
    ${createFontStyles('body-3')};
    align-items: center;
    border-radius: ${theme.borderRadius.default};
    color: ${theme.color[variant === 'destructive' ? 'error' : 'primary']};
    cursor: pointer;
    display: flex;
    justify-content: left;
    outline: none;
    padding: ${theme.spacing[2]} ${theme.spacing[4]};
    height: 36px;

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

const StyledSeparator = styled(RadixDropdown.Separator)`
  ${({ theme }) => css`
    background: ${theme.borderColor.tertiary};
    height: 0.5px;
  `}
`;

const StyledGroup = styled(RadixDropdown.Group)`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]};
  `}
`;

const GroupTitle = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.tertiary};
    display: flex;
    padding: ${theme.spacing[3]} ${theme.spacing[4]} ${theme.spacing[2]};
  `};
`;

const Dropdown = {
  Content: StyledDropdownContent,
  Divider: StyledDivider,
  Group: StyledGroup,
  GroupTitle,
  Indicator: RadixDropdown.ItemIndicator,
  Item: StyledDropdownItem,
  Portal: RadixDropdown.Portal,
  Root: RadixDropdown.Root,
  Separator: StyledSeparator,
  Sub: RadixDropdown.Sub,
  SubContent: StyledSubContent,
  SubTrigger: StyledSubTrigger,
  Trigger: StyledDropdownTrigger,
};

export default Dropdown;
