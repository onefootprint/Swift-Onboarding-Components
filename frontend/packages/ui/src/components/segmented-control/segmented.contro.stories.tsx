import { Meta, Story } from '@storybook/react';
import React from 'react';

import SegmentedControl, { SegmentedControlProps } from './segmented-control';

export default {
  component: SegmentedControl,
  title: 'Components/SegmentedControl',
  argTypes: {
    'aria-label': {
      control: 'text',
      description: 'Aria label for the segmented control',
      required: true,
    },
    onChange: {
      description: 'Event when option selected changes',
      required: true,
    },
    options: {
      control: 'array',
      description: 'Array of options in tabs',
      required: true,
    },
    value: {
      control: 'text',
      description: 'Value of the selected option',
      required: true,
    },
  },
} as Meta;

const Template: Story<SegmentedControlProps> = ({
  'aria-label': ariaLabel,
  onChange,
  options,
  value,
}: SegmentedControlProps) => (
  <SegmentedControl
    aria-label={ariaLabel}
    onChange={onChange}
    options={options}
    value={value}
  />
);

export const Base = Template.bind({});
Base.args = {
  'aria-label': 'Segmented Control',
  onChange: () => console.log,
  options: ['Option 1', 'Option 2', 'Option 3'],
  value: 'Option 1',
};
