import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';
import Content from './content';
import Group from './group';
import GroupTitle from './group-title';
import Item from './item';
import ItemIndicator from './item-indicator';
import RadioGroup from './radio-group';
import RadioItem from './radio-item';
import SubContent from './sub-content';
import SubTrigger from './sub-trigger';
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
  Indicator: RadixDropdown.ItemIndicator,
  Sub: RadixDropdown.Sub,
  Trigger: Trigger,
  Content: Content,
  Group: Group,
  GroupTitle: GroupTitle,
  Divider: Divider,
  RadioGroup: RadioGroup,
  RadioItem: RadioItem,
  RadioIndicator: ItemIndicator,
  Item: Item,
  SubContent: SubContent,
  SubTrigger: SubTrigger,
};

export default Dropdown;
