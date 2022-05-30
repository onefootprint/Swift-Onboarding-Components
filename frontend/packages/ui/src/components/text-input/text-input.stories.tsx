import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import TextInput, { TextInputProps } from './text-input';

export default {
  component: TextInput,
  title: 'Components/TextInput',
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
    value: {
      control: 'text',
      description: 'Controlled value',
    },
  },
} as Meta;

const Template: Story<TextInputProps> = ({
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
      value={value}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  mask: undefined,
  disabled: false,
  hintText: '',
  label: 'Email',
  maxLength: 100,
  minLength: 0,
  onChange: console.log,
  placeholder: 'your.email@email.com',
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
