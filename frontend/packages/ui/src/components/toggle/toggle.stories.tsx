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
  },
} as Meta;

const Template: Story<ToggleProps> = ({
  checked: initialChecked,
  defaultChecked,
  disabled,
  id,
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
      id={id}
      name={name}
      onBlur={onBlur}
      onChange={event => {
        const nextValue = event.target.checked;
        setChecked(nextValue);
        onChange(event);
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
  id: 'toggle-id',
  name: 'toggle',
  onBlur: console.log,
  onChange: console.log,
  onFocus: console.log,
  required: false,
};
