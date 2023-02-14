import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';

import { createFontStyles, createOverlayBackground } from '../../utils';
import Divider from '../divider';

const StyledDropdownTrigger = styled(RadixDropdown.Trigger)`
  ${({ theme }) => css`
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
      ${createOverlayBackground('darken-2', 'primary')};
    }

    &:enabled:hover {
      ${createOverlayBackground('darken-1', 'primary')};
    }

    &:disabled {
      cursor: initial;
      opacity: 0.5;
    }
  `}
`;

const StyledDropdownContent = styled(RadixDropdown.Content)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    min-width: 200px;
    padding: ${theme.spacing[3]} 0;
  `}
`;

const StyledDropdownItem = styled(RadixDropdown.Item)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    cursor: pointer;
    color: ${theme.color.primary};
    padding: ${theme.spacing[2]} ${theme.spacing[5]};
    outline: none;

    :hover,
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
