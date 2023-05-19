import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import CardNumberInput, { CardNumberInputProps } from './card-number-input';

export default {
  component: CardNumberInput,
  title: 'Components/CardNumberInput',
  argTypes: {
    hasError: {
      control: 'boolean',
      description: 'Gives an error state to the CVC input and hint',
      required: false,
    },
    hint: {
      control: 'text',
      description: 'Display an informative text',
      required: false,
    },
    invalidMessage: {
      control: 'text',
      description:
        'Message to display when the input is invalid. Useful for i18n',
      required: false,
    },
    disabled: {
      control: 'boolean',
      description: 'Disable interactions',
      required: false,
    },
    onChange: {
      control: 'function',
      description: 'Function called when the input changes',
      required: false,
    },
    onChangeText: {
      control: 'function',
      description: 'Function called when the value changes',
      required: false,
    },
    value: {
      control: 'text',
      description: 'Value of the input',
      required: false,
    },
  },
} as Meta;

const Template: Story<CardNumberInputProps> = ({
  disabled,
  hasError,
  hint,
  invalidMessage,
  onChange,
  onChangeText,
  value: initialValue,
}: CardNumberInputProps) => {
  const [value, setValue] = useState<string | undefined>(initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    onChange?.(event);
  };

  return (
    <CardNumberInput
      disabled={disabled}
      hasError={hasError}
      hint={hint}
      invalidMessage={invalidMessage}
      onChange={handleChange}
      onChangeText={onChangeText}
      value={value}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  disabled: false,
  hasError: false,
  hint: '',
  invalidMessage: 'Invalid card number',
  onChange: console.log,
  onChangeText: console.log,
  value: '',
};
