import * as RadixSelect from '@radix-ui/react-select';
import Content from './components/content';
import Group from './components/group';
import Icon from './components/icon';
import Input from './components/input';
import Item from './components/item';
import Trigger from './components/trigger';

const SelectCustom = {
  Root: RadixSelect.Root,
  Portal: RadixSelect.Portal,
  Trigger,
  Content,
  Item,
  Group,
  Value: RadixSelect.Value,
  ChevronIcon: Icon,
  Input,
};

export default SelectCustom;
