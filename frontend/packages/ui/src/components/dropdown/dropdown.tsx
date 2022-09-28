import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';

import { createFontStyles, createOverlayBackground } from '../../utils';
import Divider from '../divider';

const StyledDropdownTrigger = styled(RadixDropdown.Trigger)`
  ${({ theme }) => css`
    align-items: center;
    background: none;
    border-radius: ${theme.borderRadius[4]}px;
    border: none;
    cursor: pointer;
    display: flex;
    height: 32px;
    justify-content: center;
    margin: 0;
    padding: 0;
    width: 32px;

    &[data-state='open'] {
      ${createOverlayBackground('darken-2', 'primary')};
    }

    &:hover {
      ${createOverlayBackground('darken-1', 'primary')};
    }
  `}
`;

const StyledDropdownContent = styled(RadixDropdown.Content)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[2]}px;
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    min-width: 200px;
    padding: ${theme.spacing[3]}px 0;
  `}
`;

const StyledDropdownItem = styled(RadixDropdown.Item)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    cursor: pointer;
    color: ${theme.color.primary};
    padding: ${theme.spacing[2]}px ${theme.spacing[5]}px;
    outline: none;

    :hover,
    :focus {
      ${createOverlayBackground('darken-1', 'primary')};
    }
  `}
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin: ${theme.spacing[2]}px 0;
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
