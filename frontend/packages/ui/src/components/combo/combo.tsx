'use client';

import * as Popover from '@radix-ui/react-popover';
import ComboContent from './components/combo-content';
import ComboGroup from './components/combo-group';
import ComboInput from './components/combo-input';
import ComboItem from './components/combo-item';
import ComboList from './components/combo-list';
import ComboRoot from './components/combo-root';

const Combo = {
  Portal: Popover.Portal,
  Trigger: Popover.Trigger,
  Root: ComboRoot,
  Content: ComboContent,
  List: ComboList,
  Item: ComboItem,
  Input: ComboInput,
  Group: ComboGroup,
};

export default Combo;
