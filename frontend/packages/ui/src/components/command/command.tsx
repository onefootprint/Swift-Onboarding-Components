'use client';

import { Command as CommandRoot } from 'cmdk';
import CommandContainer from './components/command-container';
import CommandDiscover from './components/command-discover';
import CommandEmpty from './components/command-empty';
import CommandGroup from './components/command-group';
import CommandInput from './components/command-input';
import CommandItem from './components/command-item';
import CommandList from './components/command-list/command-list';
import CommandSeparator from './components/command-separator';
import CommandShortcut from './components/command-shortcut';

const Command = {
  Root: CommandRoot,
  Container: CommandContainer,
  Input: CommandInput,
  Shortcut: CommandShortcut,
  List: CommandList,
  Empty: CommandEmpty,
  Group: CommandGroup,
  Item: CommandItem,
  Separator: CommandSeparator,
  Discover: CommandDiscover,
};

export default Command;
