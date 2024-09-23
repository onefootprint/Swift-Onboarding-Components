import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Button from '../button';
import Command from './command';

const meta: Meta<typeof Command.Container> = {
  title: 'Components/Command',
  component: Command.Container,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Command.Container>;

const CommandDemo = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const toggleOpen = () => setOpen(!open);

  const handleSelect = (selectedValue: string) => {
    alert(`Selected: ${selectedValue}`);
  };

  const commandContent = (
    <>
      <Command.Input value={value} onValueChange={setValue} onErase={() => setValue('')} />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        <Command.Group heading="Fruits">
          <Command.Item value="apple" onSelect={() => handleSelect('apple')}>
            Apple
          </Command.Item>
          <Command.Item value="banana" onSelect={() => handleSelect('banana')}>
            Banana
          </Command.Item>
          <Command.Item value="orange" onSelect={() => handleSelect('orange')}>
            Orange
          </Command.Item>
        </Command.Group>
        <Command.Group heading="Vegetables">
          <Command.Item value="carrot" onSelect={() => handleSelect('carrot')}>
            Carrot
          </Command.Item>
          <Command.Item value="broccoli" onSelect={() => handleSelect('broccoli')}>
            Broccoli
          </Command.Item>
          <Command.Item value="spinach" onSelect={() => handleSelect('spinach')}>
            Spinach
          </Command.Item>
        </Command.Group>
      </Command.List>
    </>
  );

  return (
    <>
      <Button variant="secondary" onClick={toggleOpen}>
        {open ? 'Close Command' : 'Open Command'}
      </Button>
      <Command.Container open={open} onOpenChange={setOpen}>
        <Command.Shortcut baseKey="Meta" ctrlKey="k" onShortcut={toggleOpen} onClose={() => setOpen(false)} />
        {commandContent}
      </Command.Container>
    </>
  );
};

export const Default: Story = {
  render: () => <CommandDemo />,
};
