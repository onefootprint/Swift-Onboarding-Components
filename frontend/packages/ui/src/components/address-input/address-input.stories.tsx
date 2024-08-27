import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import type { AddressInputProps } from './address-input';
import AddressInput from './address-input';

export default {
  component: AddressInput,
  title: 'Components/AddressInput',
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Specifies that the input element should be disabled',
      required: false,
      table: { defaultValue: { summary: 'false' } },
    },
    hasError: {
      control: 'boolean',
      description: 'Gives an error state to the input and hint',
      required: false,
      table: { defaultValue: { summary: 'false' } },
    },
    hint: {
      control: 'text',
      description: 'Display an informative text below the input',
      required: false,
    },
    label: {
      control: 'text',
      description: 'Displays a label text, above the input',
      required: false,
    },
    onChangeText: {
      description: 'Event when the text changes, sending only the text',
      required: false,
    },
    placeholder: {
      control: 'text',
      description: 'An informative text that goes inside the input',
      required: false,
      name: 'Placeholder *',
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
    value: {
      control: 'text',
      description: 'Controlled value',
    },
  },
} as Meta;

const Template: StoryFn<AddressInputProps> = ({
  disabled,
  hasError,
  hint,
  label,
  onChangeText,
  onSelect,
  placeholder,
  testID,
  value: initialValue = '',
}: AddressInputProps) => {
  const [value, setValue] = useState<string>(initialValue);

  const handleChangeText = (text: string) => {
    setValue(text);
    onChangeText?.(text);
  };

  return (
    <AddressInput
      country="US"
      disabled={disabled}
      hasError={hasError}
      hint={hint}
      label={label}
      onChangeText={handleChangeText}
      onSelect={onSelect}
      placeholder={placeholder}
      testID={testID}
      value={value}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  disabled: false,
  hint: '',
  label: 'Address line 1',
  onSelect: console.log, // eslint-disable-line no-console
  placeholder: 'Street and house number',
  testID: 'input-test-id',
  value: '',
  hasError: false,
};

export const WithInitialValue = Template.bind({});
WithInitialValue.args = {
  label: 'Address line 1',
  onSelect: console.log, // eslint-disable-line no-console
  placeholder: 'Street and house number',
  value: '14 linda street',
};

export const WithHint = Template.bind({});
WithHint.args = {
  hint: 'Hint',
  label: 'Address line 1',
  onSelect: console.log, // eslint-disable-line no-console
  placeholder: 'Street and house number',
  value: '',
};

export const WithError = Template.bind({});
WithError.args = {
  hasError: true,
  hint: 'Hint',
  label: 'Address line 1',
  onSelect: console.log, // eslint-disable-line no-console
  placeholder: 'Street and house number',
  value: '',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  label: 'Address line 1',
  onSelect: console.log, // eslint-disable-line no-console
  placeholder: 'Street and house number',
  value: '',
};
