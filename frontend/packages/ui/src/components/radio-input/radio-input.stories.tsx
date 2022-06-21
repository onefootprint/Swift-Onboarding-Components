import { Meta, Story } from '@storybook/react';
import React, { useEffect, useState } from 'react';

import RadioInput, { RadioInputProps } from './radio-input';

export default {
  component: RadioInput,
  title: 'Components/RadioInput',
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text, rendered next to the input',
      required: true,
    },
    required: {
      control: 'boolean',
      description: 'Input is required or not',
    },
    disabled: {
      control: 'boolean',
      description: 'Input is disabled or not',
    },
    checked: {
      control: 'boolean',
      description: 'Input is checked or not',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Input is checked or not, for uncontrolled inputs',
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as Meta;

const Template: Story<RadioInputProps> = ({
  checked: checkedProp,
  disabled,
  hasError,
  hintText,
  id,
  label,
  name,
  onChange,
  required,
  testID,
}: RadioInputProps) => {
  const [checked, setChecked] = useState(checkedProp);

  useEffect(() => {
    setChecked(checkedProp);
  }, [checkedProp]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    onChange?.(event);
  };

  return (
    <RadioInput
      checked={checked}
      disabled={disabled}
      hasError={hasError}
      hintText={hintText}
      id={id}
      label={label}
      name={name}
      onChange={handleChange}
      required={required}
      testID={testID}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  checked: false,
  disabled: false,
  hasError: false,
  hintText: '',
  id: 'radio-button-id',
  label: 'This is a RadioInput label',
  name: 'checkbox-name',
  onChange: console.log,
  required: false,
  testID: 'checkbox-test-id',
};
