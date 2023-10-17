import styled, { css } from '@onefootprint/styled';
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';

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
        background-color: ${theme.backgroundColor.secondary};
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

const StyledDropdownContent = styled(RadixDropdown.Content)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    min-width: 200px;
    padding: ${theme.spacing[2]};
    z-index: ${theme.zIndex.dropdown};
  `}
`;

const StyledDropdownItem = styled(RadixDropdown.Item)<{
  variant?: 'default' | 'destructive';
}>`
  ${({ theme, variant }) => css`
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
  `}
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin: ${theme.spacing[2]} 0;
  `}
`;

const Dropdown = {
  Content: StyledDropdownContent,
  Trigger: StyledDropdownTrigger,
  Root: RadixDropdown.Root,
  Portal: RadixDropdown.Portal,
  Item: StyledDropdownItem,
  Divider: StyledDivider,
};

export default Dropdown;
