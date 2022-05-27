import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import TextArea, { TextAreaProps } from './text-area';

export default {
  component: TextArea,
  title: 'Components/TextArea',
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
    value: {
      control: 'text',
      description: 'Controlled value',
    },
  },
} as Meta;

const Template: Story<TextAreaProps> = ({
  disabled,
  hasError,
  hintText,
  label,
  maxLength,
  minLength,
  onChange,
  onChangeText,
  placeholder,
  testID,
  value: initialValue = '',
}: TextAreaProps) => {
  const [value, setValue] = useState<string>(initialValue);
  const handleChangeText = (text: string) => {
    setValue(text);
    if (onChangeText) onChangeText(text);
  };
  return (
    <TextArea
      disabled={disabled}
      hasError={hasError}
      hintText={hintText}
      label={label}
      maxLength={maxLength}
      minLength={minLength}
      onChange={onChange}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      testID={testID}
      value={value}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  disabled: false,
  hintText: '',
  label: 'Specify the reason',
  onChange: console.log,
  onChangeText: console.log,
  placeholder: '',
  testID: 'input-test-id',
  value: '',
};
