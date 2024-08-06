import type { Meta, Story } from '@storybook/react';
import { useState } from 'react';

import type { TextInputProps } from './text-input';
import TextInput from './text-input';

export default {
  component: TextInput,
  title: 'Components/TextInput',
  argTypes: {
    mask: {
      control: 'object',
      description: 'Specify a mask using Cleave.js (https://github.com/nosir/cleave.js/tree/master/doc)',
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
    value: {
      control: 'text',
      description: 'Controlled value',
    },
    size: {
      control: 'select',
      description: 'Input size',
      options: ['default', 'compact'],
      required: false,
    },
  },
} as Meta;

const Template: Story<TextInputProps> = ({
  disabled,
  hasError,
  hint,
  label,
  mask,
  maxLength,
  minLength,
  onChange,
  onChangeText,
  placeholder,
  size,
  testID,
  type,
  value: initialValue = '',
}: TextInputProps) => {
  const [value, setValue] = useState<string>(initialValue);
  const handleChangeText = (text: string) => {
    setValue(text);
    if (onChangeText) onChangeText(text);
  };
  return (
    <TextInput
      disabled={disabled}
      hasError={hasError}
      hint={hint}
      label={label}
      mask={mask}
      maxLength={maxLength}
      minLength={minLength}
      onChange={onChange}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      size={size}
      testID={testID}
      type={type}
      value={value}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  disabled: false,
  hasError: false,
  hint: '',
  label: 'Email',
  mask: undefined,
  maxLength: 100,
  minLength: 0,
  onChange: console.log, // eslint-disable-line no-console
  placeholder: 'jane.doe@acme.com',
  size: 'default',
  testID: 'input-test-id',
  type: 'email',
  value: '',
};

export const WithMask = Template.bind({});
WithMask.args = {
  label: 'Date of birth',
  placeholder: 'MM/DD/YYYY',
  mask: {
    date: true,
    delimiter: '/',
    datePattern: ['m', 'd', 'Y'],
  },
};
