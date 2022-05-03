import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import InputText, { InputTextProps } from './input-text';

export default {
  component: InputText,
  title: 'Components/InputText',
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
    mask: {
      control: 'text',
      description: 'Format text upon typing on the input field',
      required: false,
    },
    maskPlaceholder: {
      control: 'text',
      description: 'Placeholder to cover unfilled parts of the mask',
      required: false,
    },
    maxLength: {
      control: 'number',
      description: 'Mask length of the text',
      required: false,
    },
    minLength: {
      control: 'number',
      description: 'Mask length of the text',
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

const Template: Story<InputTextProps> = ({
  disabled,
  hasError,
  hintText,
  label,
  mask,
  maskPlaceholder,
  maxLength,
  minLength,
  onChange,
  onChangeText,
  placeholder,
  testID,
  type,
  value: initialValue = '',
}: InputTextProps) => {
  const [value, setValue] = useState<string>(initialValue);
  const handleChangeText = (text: string) => {
    setValue(text);
    if (onChangeText) onChangeText(text);
  };
  return (
    <InputText
      disabled={disabled}
      hasError={hasError}
      hintText={hintText}
      label={label}
      mask={mask}
      maskPlaceholder={maskPlaceholder}
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
  disabled: false,
  hintText: '',
  label: 'Email',
  mask: '',
  maskPlaceholder: '',
  maxLength: 100,
  minLength: 0,
  onChange: console.log,
  placeholder: 'your.email@email.com',
  testID: 'input-test-id',
  type: 'email',
  value: '',
};

export const WithHint = Template.bind({});
WithHint.args = {
  hintText: 'Hint',
  label: 'Name',
  onChange: console.log,
  placeholder: 'Placeholder',
  value: '',
};

export const WithoutLabel = Template.bind({});
WithoutLabel.args = {
  onChange: console.log,
  placeholder: 'Placeholder',
  value: '',
};

export const WithError = Template.bind({});
WithError.args = {
  hasError: true,
  hintText: 'Hint',
  label: 'Address',
  onChange: console.log,
  placeholder: 'Placeholder',
  value: '',
};

export const WithMask = Template.bind({});
WithMask.args = {
  label: 'Day of birthday',
  mask: '99/99/9999',
  onChange: console.log,
  onChangeText: console.log,
  placeholder: 'MM/DD/YYYY',
  value: '',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  label: 'Placeholder',
  onChange: console.log,
  placeholder: 'Text',
  value: '',
};
