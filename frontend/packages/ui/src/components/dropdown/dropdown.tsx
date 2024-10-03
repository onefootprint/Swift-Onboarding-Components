import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';
import Content from './content';
import Group from './group';
import GroupTitle from './group-title';
import Item from './item';
import ItemIndicator from './item-indicator';
import RadioGroup from './radio-group';
import RadioItem from './radio-item';
import Trigger from './trigger';

const Divider = styled(RadixDropdown.Separator)`
  ${({ theme }) => css`
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    height: ${theme.borderWidth[1]};
    box-sizing: border-box;
  `}
`;

const Dropdown = {
  Portal: RadixDropdown.Portal,
  Root: RadixDropdown.Root,
  Trigger,
  Content,
  Group,
  GroupTitle,
  Divider,
  RadioGroup,
  RadioItem,
  ItemIndicator,
  Item,
};

export default Dropdown;
