import * as storybook from '@storybook/test';
import { expect, within } from '@storybook/test';

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Button from '../button';
import Text from '../text';
import Combo from './combo';

const userEvent = storybook.userEvent.setup({ delay: 100 });
const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date', disabled: true },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
  { value: 'honeydew', label: 'Honeydew' },
  { value: 'kiwi', label: 'Kiwi' },
  { value: 'lemon', label: 'Lemon' },
  { value: 'mango', label: 'Mango' },
  { value: 'nectarine', label: 'Nectarine' },
];

const Template = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  return (
    <Combo.Root open={open} onOpenChange={setOpen}>
      <Combo.Trigger asChild>
        <Button type="button" variant="secondary">
          <Text variant="label-1">{value || 'Select fruit'}</Text>
        </Button>
      </Combo.Trigger>
      <Combo.Content>
        <Combo.Input />
        <Combo.List emptyText="No fruit found">
          <Combo.Group>
            {fruits.map(fruit => (
              <Combo.Item
                key={fruit.value}
                value={fruit.value}
                disabled={fruit.disabled}
                onSelect={currentValue => {
                  setValue(currentValue === value ? '' : currentValue);
                  setOpen(false);
                }}
              >
                {fruit.label}
              </Combo.Item>
            ))}
          </Combo.Group>
        </Combo.List>
      </Combo.Content>
    </Combo.Root>
  );
};

export default {
  component: Template,
  title: 'Components/Combo',
} satisfies Meta<typeof Template>;

type Story = StoryObj<typeof Template>;

export const Default: Story = {};

export const SelectItemInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Open the combo', async () => {
      const triggerButton = canvas.getByRole('button', { name: 'Select fruit' });
      await userEvent.click(triggerButton);
      await canvas.findByRole('dialog');
      const dialog = canvas.getByRole('dialog');
      expect(within(dialog).getByRole('listbox')).toBeInTheDocument();
    });

    await step('Select an option', async () => {
      const dialog = canvas.getByRole('dialog');
      const appleOption = within(dialog).getByText('Apple');
      await userEvent.click(appleOption);
      expect(canvas.getByRole('button', { name: 'apple' })).toBeInTheDocument();
      expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

export const SearchOptionAndSelect: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Open the combo', async () => {
      const triggerButton = canvas.getByRole('button', { name: 'Select fruit' });
      await userEvent.click(triggerButton);
      await canvas.findByRole('dialog');
      const dialog = canvas.getByRole('dialog');
      expect(within(dialog).getByRole('listbox')).toBeInTheDocument();
    });

    await step('Search for an option', async () => {
      const dialog = canvas.getByRole('dialog');
      const input = within(dialog).getByRole('combobox');
      await userEvent.type(input, 'apple');

      const options = within(dialog).getAllByRole('option');
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('Apple');

      const banana = within(dialog).queryByRole('option', { name: 'Banana' });
      expect(banana).not.toBeInTheDocument();
    });

    await step('Clean search input and verify all options', async () => {
      const dialog = canvas.getByRole('dialog');
      const input = within(dialog).getByRole('combobox');
      await userEvent.clear(input);
      expect(input).toHaveValue('');

      const options = within(dialog).getAllByRole('option');
      expect(options.length).toBeGreaterThan(1);

      fruits.forEach(fruit => {
        if (!fruit.disabled) {
          expect(within(dialog).getByRole('option', { name: fruit.label })).toBeInTheDocument();
        }
      });
    });
  },
};

export const NavigationWithKeyboard: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Open the combo', async () => {
      const triggerButton = canvas.getByRole('button', { name: 'Select fruit' });
      await userEvent.click(triggerButton);
      await canvas.findByRole('dialog');
      const dialog = canvas.getByRole('dialog');
      expect(within(dialog).getByRole('listbox')).toBeInTheDocument();
    });

    await step('Navigate through options with arrow keys', async () => {
      const dialog = canvas.getByRole('dialog');
      await userEvent.keyboard('{ArrowDown}');
      const secondOption = within(dialog).getAllByRole('option')[1];
      expect(secondOption).toHaveAttribute('aria-selected', 'true');
      expect(secondOption).toHaveAttribute('data-selected', 'true');
    });

    await step('Select option with Enter key', async () => {
      await userEvent.keyboard('{Enter}');
      expect(canvas.getByRole('button', { name: 'banana' })).toBeInTheDocument();
      expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};
