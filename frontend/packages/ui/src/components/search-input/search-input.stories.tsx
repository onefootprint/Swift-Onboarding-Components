import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import type { SearchInputProps } from './search-input';
import SearchInput from './search-input';

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
    value: {
      control: 'text',
      description: 'Controlled value',
    },
    size: {
      control: 'select',
      description: 'Size of the input',
      options: ['compact', 'default'],
    },
  },
} as Meta;

const Template: StoryFn<SearchInputProps> = ({
  onChange,
  onChangeText,
  onReset,
  placeholder,
  testID,
  value: initialValue = '',
  size,
}: SearchInputProps) => {
  const [value, setValue] = useState<string>(initialValue);
  const handleChangeText = (text: string) => {
    setValue(text);
    if (onChangeText) onChangeText(text);
  };
  return (
    <SearchInput
      onChange={onChange}
      onChangeText={handleChangeText}
      onReset={onReset}
      placeholder={placeholder}
      testID={testID}
      value={value}
      size={size}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  onReset: () => {
    console.log('onReset'); // eslint-disable-line no-console
  },
  onChange: console.log, // eslint-disable-line no-console
  onChangeText: console.log, // eslint-disable-line no-console
  placeholder: 'Search...',
  testID: 'search-input-test-id',
  value: '',
};
