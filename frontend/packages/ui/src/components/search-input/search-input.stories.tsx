import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import SearchInput, { SearchInputProps } from './search-input';

export default {
  component: SearchInput,
  title: 'Components/SearchInput',
  argTypes: {
    mask: {
      control: 'object',
      description:
        'Specify a mask using Cleave.js (https://github.com/nosir/cleave.js/tree/master/doc)',
      required: false,
    },
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
    hintText: {
      control: 'text',
      description: 'Display an informative text below the input',
      required: false,
    },
    label: {
      control: 'text',
      description: 'Displays a label text, above the input',
      required: false,
    },
    maxLength: {
      control: 'number',
      description: 'Max length of the text',
      required: false,
    },
    minLength: {
      control: 'number',
      description: 'Max length of the text',
      required: false,
    },
    onChange: {
      description: 'Native onChange event',
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
    type: {
      control: 'text',
      description: 'Type of the input (e.g tel, date, number)',
      table: { defaultValue: { summary: 'text' } },
    },
    inputSize: {
      control: 'select',
      options: ['default', 'large', 'compact'],
    },
    value: {
      control: 'text',
      description: 'Controlled value',
    },
  },
} as Meta;

const Template: Story<SearchInputProps> = ({
  disabled,
  hasError,
  hintText,
  label,
  mask,
  maxLength,
  minLength,
  onChange,
  onChangeText,
  placeholder,
  testID,
  type,
  inputSize,
  value: initialValue = '',
}: SearchInputProps) => {
  const [value, setValue] = useState<string>(initialValue);
  const handleChangeText = (text: string) => {
    setValue(text);
    if (onChangeText) onChangeText(text);
  };
  return (
    <SearchInput
      disabled={disabled}
      hasError={hasError}
      hintText={hintText}
      label={label}
      mask={mask}
      maxLength={maxLength}
      minLength={minLength}
      onChange={onChange}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      testID={testID}
      type={type}
      inputSize={inputSize}
      value={value}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  mask: undefined,
  disabled: false,
  hintText: '',
  label: 'Search',
  maxLength: 100,
  minLength: 0,
  onChange: console.log,
  placeholder: 'Search...',
  testID: 'input-test-id',
  type: 'search',
  value: '',
  inputSize: 'default',
};
