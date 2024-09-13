import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';
import Content from './content';
import Group from './group';
import GroupTitle from './group-title';
import Item from './item';
import ItemIndicator from './item-indicator';
import RadioGroup from './radio-group';
import RadioItem from './radio-item';
import SubContent from './sub/subcontent';
import SubTrigger from './sub/subtrigger';
import Trigger from './trigger';

const Separator = styled(RadixDropdown.Separator)`
  ${({ theme }) => css`
    background: ${theme.borderColor.tertiary};
    height: 0.5px;
  `}
`;

const Dropdown = {
  Portal: RadixDropdown.Portal,
  Root: RadixDropdown.Root,
  Trigger: Trigger,
  Content: Content,
  Group: Group,
  GroupTitle,
  Divider: Separator,
  Separator: Separator,
  RadioGroup: RadioGroup,
  RadioItem: RadioItem,
  RadioIndicator: ItemIndicator,
  Indicator: RadixDropdown.ItemIndicator,
  Item: Item,
  Sub: RadixDropdown.Sub,
  SubContent: SubContent,
  SubTrigger: SubTrigger,
};

export default Dropdown;
