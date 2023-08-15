import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import Stepper, { StepperProps } from './stepper';

export default {
  component: Stepper,
  title: 'Components/Stepper',
  argTypes: {
    'aria-label': {
      control: 'text',
      description: 'Aria-label',
    },
    options: {
      control: 'object',
      description: 'An array containing the options, with label and value',
    },
    value: {
      control: 'object',
      description: 'The selected option',
    },
    onChange: {
      control: 'function',
      description: 'Callback when the option is changed',
    },
  },
} as Meta;

const Template: Story<StepperProps> = ({
  'aria-label': ariaLabel,
  options,
  value,
  onChange,
}: StepperProps) => {
  const [val, setVal] = useState(value);

  return (
    <Stepper
      aria-label={ariaLabel}
      options={options}
      value={val}
      onChange={newValue => {
        setVal(newValue);
        onChange?.(newValue);
      }}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  'aria-label': 'Select',
  options: [
    { label: 'Who to onboard', value: 'who-to-onboard' },
    { label: 'Your Playbook', value: 'your-playbook' },
    { label: 'Name your Playbook', value: 'name-your-playbook' },
  ],
  value: { label: 'Your Playbook', value: 'your-playbook' },
  onChange: console.log,
};
