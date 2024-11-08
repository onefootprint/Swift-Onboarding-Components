'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';

import Content from './components/content';
import Trigger from './components/trigger';

const Popover = {
  Root: PopoverPrimitive.Root,
  Portal: PopoverPrimitive.Portal,
  Arrow: PopoverPrimitive.Arrow,
  Content,
  Trigger,
};

export default Popover;
