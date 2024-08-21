import type { Meta, Story } from '@storybook/react';
import type React from 'react';
import { useState } from 'react';

import PhoneInput from './phone-input';
import type { PhoneInputProps } from './phone-input.types';

export default {
  component: PhoneInput,
  title: 'Components/PhoneInput',
} as Meta;

const Template: Story<PhoneInputProps> = ({
  disabled,
  hasError,
  hint,
  onChange,
  onChangeText,
  onReset,
  value: initialValue,
  locale,
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
      hint={hint}
      label="Phone"
      name="phone"
      locale={locale}
      onChange={handleChange}
      onChangeText={onChangeText}
      onReset={handleReset}
      value={value}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  disabled: false,
  hasError: false,
  hint: 'Enter your phone number',
  onChange: console.log,
  onChangeText: console.log,
  value: '',
  locale: 'es-MX',
  onReset: () => {
    console.log('onReset'); // eslint-disable-line no-console
  },
};
