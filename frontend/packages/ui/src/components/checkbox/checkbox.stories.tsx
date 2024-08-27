import type { Meta, StoryFn } from '@storybook/react';
import type React from 'react';
import { useEffect, useState } from 'react';

import type { CheckboxProps } from './checkbox';
import Checkbox from './checkbox';

export default {
  component: Checkbox,
  title: 'Components/Checkbox',
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
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as Meta;

const Template: StoryFn<CheckboxProps> = ({
  checked: checkedProp,
  disabled,
  hasError,
  hint,
  id,
  label,
  name,
  onChange,
  required,
  testID,
}: CheckboxProps) => {
  const [checked, setChecked] = useState(checkedProp);

  useEffect(() => {
    setChecked(checkedProp);
  }, [checkedProp]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    onChange?.(event);
  };

  return (
    <Checkbox
      checked={checked}
      disabled={disabled}
      hasError={hasError}
      hint={hint}
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
  hint: '',
  id: 'checkbox-id',
  label: 'This is a checkbox label',
  name: 'checkbox-name',
  onChange: console.log, // eslint-disable-line no-console
  required: false,
  testID: 'checkbox-test-id',
};
