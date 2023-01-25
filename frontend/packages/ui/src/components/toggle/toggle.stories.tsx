import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import Toggle, { ToggleProps } from './toggle';

export default {
  component: Toggle,
  title: 'Components/Toggle',
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Indicate if the toggle is checked or not',
      required: false,
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Default checked value',
      required: false,
    },
    id: {
      control: 'text',
      description: 'id assigned to input',
      required: false,
    },
    name: {
      control: 'text',
      description:
        'The name of the input field in a checkbox (Useful for form submission).',
      required: false,
    },
    disabled: {
      control: 'boolean',
      description: 'If true, the checkbox will be disabled',
      required: false,
    },
    fullWidth: {
      control: 'boolean',
      description: 'Use 100% of the parent container width',
      required: false,
    },
    label: {
      control: 'text',
      description: 'Toggle label',
      required: false,
    },
    labelPlacement: {
      control: {
        type: 'select',
      },
      type: { name: 'string', required: false },
      description: 'Label placement',
      options: ['left', 'right'],
      table: { defaultValue: { summary: 'left' } },
    },
    required: {
      control: 'boolean',
      description:
        'If true, the checkbox input is marked as required, and required attribute will be added',
      required: false,
    },
    onBlur: {
      control: 'function',
      description:
        'The callback invoked when the checkbox is blurred (loses focus)',
      required: false,
    },
    onChange: {
      control: 'function',
      description:
        'The callback invoked when the checked state of the Checkbox changes.',
      required: false,
    },
    onFocus: {
      control: 'function',
      description: 'The callback invoked when the checkbox is focused',
      required: false,
    },
  },
} as Meta;

const Template: Story<ToggleProps> = ({
  checked: initialChecked,
  defaultChecked,
  disabled,
  fullWidth,
  id,
  label,
  labelPlacement,
  name,
  onBlur,
  onChange,
  onFocus,
  required,
}: ToggleProps) => {
  const [checked, setChecked] = useState<boolean | undefined>(initialChecked);

  return (
    <Toggle
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      fullWidth={fullWidth}
      id={id}
      label={label}
      labelPlacement={labelPlacement}
      name={name}
      onBlur={onBlur}
      onChange={event => {
        const nextValue = event.target.checked;
        setChecked(nextValue);
        onChange?.(event);
      }}
      onFocus={onFocus}
      required={required}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  checked: false,
  defaultChecked: false,
  disabled: false,
  fullWidth: false,
  id: 'toggle-id',
  label: 'Toggle',
  labelPlacement: 'left',
  name: 'toggle',
  onBlur: console.log,
  onChange: console.log,
  onFocus: console.log,
  required: false,
};
