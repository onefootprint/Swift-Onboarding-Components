import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import SearchInput, { SearchInputProps } from './search-input';

export default {
  component: SearchInput,
  title: 'Components/SearchInput',
  argTypes: {
    onChange: {
      description: 'Native onChange event',
      required: false,
    },
    onChangeText: {
      description: 'Event when the text changes, sending only the text',
      required: false,
    },
    onReset: {
      description: 'Event when the clear button is clicked',
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
  inputSize,
  onChange,
  onChangeText,
  onReset,
  placeholder,
  testID,
  value: initialValue = '',
}: SearchInputProps) => {
  const [value, setValue] = useState<string>(initialValue);
  const handleChangeText = (text: string) => {
    setValue(text);
    if (onChangeText) onChangeText(text);
  };
  return (
    <SearchInput
      inputSize={inputSize}
      onChange={onChange}
      onChangeText={handleChangeText}
      onReset={onReset}
      placeholder={placeholder}
      testID={testID}
      value={value}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  onReset: () => {
    console.log('onReset');
  },
  onChange: console.log,
  onChangeText: console.log,
  placeholder: 'Search...',
  testID: 'search-input-test-id',
  value: '',
  inputSize: 'default',
};
