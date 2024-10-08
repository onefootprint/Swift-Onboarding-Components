import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Box from '../box';
import SelectCustom from './select-custom';

import * as storybook from '@storybook/test';
import { expect, within } from '@storybook/test';

const userEvent = storybook.userEvent.setup({ delay: 100 });

const options = [
  { value: 'apple', label: 'Apple', emoji: '🍎' },
  { value: 'banana', label: 'Banana', emoji: '🍌' },
  { value: 'orange', label: 'Orange', emoji: '🍊' },
  { value: 'grape', label: 'Grape', emoji: '🍇' },
  { value: 'pear', label: 'Pear', emoji: '🍐' },
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

const Template = (args: { defaultValue?: string }) => {
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
};

const meta: Meta<typeof SelectCustom.Root> = {
  title: 'Components/SelectCustom',
  component: Template,
  argTypes: {
    defaultValue: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof SelectCustom.Root>;

export const Default: Story = {
  args: {
    defaultValue: '',
  },
};

export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'banana',
  },
};

export const Compact: Story = {
  render: args => {
    const [value, setValue] = useState(args.defaultValue || '');
    return (
      <CenterAligner>
        <SelectCustom.Root value={value} onValueChange={setValue}>
          <SelectCustom.Trigger>
            <SelectCustom.Value placeholder="Select a fruit">{renderValue(value)}</SelectCustom.Value>
            <SelectCustom.ChevronIcon />
          </SelectCustom.Trigger>
          <SelectCustom.Content>
            <SelectCustom.Group>
              {options.map(option => (
                <SelectCustom.Item key={option.value} value={option.value} size="compact">
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

export const CustomWidth: Story = {
  render: args => {
    const [value, setValue] = useState(args.defaultValue || '');
    return (
      <CenterAligner>
        <SelectCustom.Root value={value} onValueChange={setValue}>
          <SelectCustom.Trigger>
            <SelectCustom.Value placeholder="Select a fruit">{renderValue(value)}</SelectCustom.Value>
            <SelectCustom.ChevronIcon />
          </SelectCustom.Trigger>
          <SelectCustom.Content width="300px">
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

export const CustomTrigger: Story = {
  render: args => {
    const [value, setValue] = useState(args.defaultValue || '');
    return (
      <CenterAligner>
        <SelectCustom.Root value={value} onValueChange={setValue}>
          <SelectCustom.Input placeholder="Select a fruit" maxWidth="300px">
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
export const WithCheckedItem: Story = {
  render: args => {
    const [value, setValue] = useState(args.defaultValue || '');
    console.log('value', value);
    return (
      <CenterAligner>
        <SelectCustom.Root value={value} onValueChange={setValue}>
          <SelectCustom.Trigger>
            <SelectCustom.Value placeholder="Select a fruit">{renderValue(value)}</SelectCustom.Value>
            <SelectCustom.ChevronIcon />
          </SelectCustom.Trigger>
          <SelectCustom.Content>
            <SelectCustom.Group>
              {options.map(option => (
                <SelectCustom.Item key={option.value} value={option.value} showChecked>
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
