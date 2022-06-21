import { Meta, Story } from '@storybook/react';
import React from 'react';

import Stepper, { StepperProps } from './stepper';

export default {
  component: Stepper,
  title: 'Components/Stepper',
  argTypes: {
    max: {
      control: 'number',
      description: 'Total number of steps',
    },
    value: {
      control: 'number',
      description: 'Active number of steps',
    },
  },
} as Meta;

const Template: Story<StepperProps> = ({ max, value }: StepperProps) => (
  <Stepper max={max} value={value} />
);

export const Base = Template.bind({});
Base.args = {
  max: 5,
  value: 3,
};
