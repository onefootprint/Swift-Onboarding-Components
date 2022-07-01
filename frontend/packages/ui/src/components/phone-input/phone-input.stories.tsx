import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import PhoneInput from './phone-input';
import type { PhoneInputProps } from './phone-input.types';

export default {
  component: PhoneInput,
  title: 'Components/PhoneInput',
} as Meta;

const Template: Story<PhoneInputProps> = ({
  disabled,
  hasError,
  hintText,
  onChange,
  onChangeText,
  onReset,
  placeholder,
  testID,
  value: initialValue,
}: PhoneInputProps) => {
  const [value, setValue] = useState<string | undefined>(initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    onChange?.(event);
  };

  const handleReset = () => {
    setValue('');
    onReset?.();
  };

  return (
    <PhoneInput
      disabled={disabled}
      hasError={hasError}
      hintText={hintText}
      label="Phone"
      onChange={handleChange}
      onChangeText={onChangeText}
      onReset={handleReset}
      placeholder={placeholder}
      testID={testID}
      value={value}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  disabled: false,
  hasError: false,
  hintText: 'Enter your phone number',
  onChange: console.log,
  onChangeText: console.log,
  placeholder: '202 555 5555',
  testID: 'phone-input-test-id',
  value: '',
  onReset: () => {
    console.log('onReset');
  },
};
