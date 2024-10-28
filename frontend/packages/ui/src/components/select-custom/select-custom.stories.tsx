import type { Meta, StoryObj } from '@storybook/react';
import * as storybook from '@storybook/test';
import { expect, within } from '@storybook/test';
import { useState } from 'react';
import Box from '../box';
import SelectCustom from './select-custom';

const userEvent = storybook.userEvent.setup({ delay: 100 });

const meta: Meta<typeof SelectCustom.Root> = {
  title: 'Components/SelectCustom',
  component: SelectCustom.Root,
  argTypes: {
    defaultValue: {
      control: 'text',
      description: 'Default selected value',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
  },
};

export default meta;

const options = [
  { value: 'apple', label: 'Apple', emoji: '🍎' },
  { value: 'banana', label: 'Banana', emoji: '🍌' },
  { value: 'orange', label: 'Orange', emoji: '🍊' },
  { value: 'grape', label: 'Grape', emoji: '🍇' },
  { value: 'pear', label: 'Pear', emoji: '🍐' },
  {
    value: 'a very long value',
    label: 'A very long label that should be truncated because it is too long',
    emoji: '🍐',
  },
];

const renderValue = (value: string) => {
  const selectedOption = options.find(option => option.value === value);
  return (
    <>
      {selectedOption?.emoji} {selectedOption?.label}
    </>
  );
};

const CenterAligner = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" width="100vw">
      {children}
    </Box>
  );
};

type Story = StoryObj<typeof SelectCustom.Root>;

export const Default: Story = {
  args: {
    defaultValue: '',
    disabled: false,
  },
  render: args => {
    const [value, setValue] = useState(args.defaultValue || '');
    return (
      <CenterAligner>
        <SelectCustom.Root {...args} value={value} onValueChange={setValue}>
          <SelectCustom.Trigger>
            <SelectCustom.Value placeholder="Select a fruit">{renderValue(value)}</SelectCustom.Value>
            <SelectCustom.ChevronIcon />
          </SelectCustom.Trigger>
          <SelectCustom.Content>
            <SelectCustom.Group>
              {options.map(option => (
                <SelectCustom.Item key={option.value} value={option.value}>
                  {option.emoji} {option.label}
                </SelectCustom.Item>
              ))}
            </SelectCustom.Group>
          </SelectCustom.Content>
        </SelectCustom.Root>
      </CenterAligner>
    );
  },
};

export const WithDefaultValue: Story = {
  ...Default,
  args: {
    ...Default.args,
    defaultValue: 'banana',
  },
};

export const CustomTrigger: Story = {
  ...Default,
  render: args => {
    const [value, setValue] = useState(args.defaultValue || '');
    return (
      <CenterAligner>
        <SelectCustom.Root value={value} onValueChange={setValue}>
          <SelectCustom.Input placeholder="Select a fruit" maxWidth="300px" disabled={args.disabled}>
            {renderValue(value)}
          </SelectCustom.Input>
          <SelectCustom.Content>
            <SelectCustom.Group>
              {options.map(option => (
                <SelectCustom.Item key={option.value} value={option.value}>
                  {option.emoji} {option.label}
                </SelectCustom.Item>
              ))}
            </SelectCustom.Group>
          </SelectCustom.Content>
        </SelectCustom.Root>
      </CenterAligner>
    );
  },
};

export const SelectInDialogs: Story = {
  ...Default,
  args: {
    ...Default.args,
  },
  render: args => {
    const [value, setValue] = useState(args.defaultValue || '');
    return (
      <CenterAligner>
        <SelectCustom.Root {...args} value={value} onValueChange={setValue}>
          <SelectCustom.Input placeholder="Select a fruit" width="400px" disabled={args.disabled}>
            {renderValue(value)}
          </SelectCustom.Input>
          <SelectCustom.Content popper>
            <SelectCustom.Group>
              {options.map(option => (
                <SelectCustom.Item key={option.value} value={option.value}>
                  {option.emoji} {option.label}
                </SelectCustom.Item>
              ))}
            </SelectCustom.Group>
          </SelectCustom.Content>
        </SelectCustom.Root>
      </CenterAligner>
    );
  },
};

export const SelectItemInteraction: Story = {
  ...Default,
  play: async ({ step }) => {
    const body = within(document.body);

    await step('Open the select', async () => {
      const triggerButton = body.getByRole('combobox');
      await userEvent.click(triggerButton);
      const listbox = await body.findByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });

    await step('Select an option', async () => {
      const appleOption = body.getByRole('option', { name: /🍎\s*Apple/i });
      await userEvent.click(appleOption);
      const triggerButton = body.getByRole('combobox');
      expect(triggerButton).toHaveTextContent('Apple');
      const listbox = body.queryByRole('listbox');
      expect(listbox).not.toBeInTheDocument();
    });
  },
};
