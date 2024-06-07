import { IcoFaceid16, IcoFingerprint16 } from '@onefootprint/icons';
import type { Meta, Story } from '@storybook/react';
import React, { useEffect } from 'react';

import type { SegmentedControlProps } from './segmented-control';
import SegmentedControl from './segmented-control';

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
}: SegmentedControlProps) => {
  const [segment, setSegment] = React.useState(value);
  const handleChange = (newVal: string) => {
    setSegment(newVal);
    onChange(newVal);
  };

  useEffect(() => {
    setSegment(value);
  }, [value]);

  return <SegmentedControl aria-label={ariaLabel} onChange={handleChange} options={options} value={segment} />;
};

export const Base = Template.bind({});
Base.args = {
  'aria-label': 'Segmented Control',
  onChange: console.log, // eslint-disable-line no-console
  options: [
    {
      label: 'Option 1',
      value: 'option-1',
      IconComponent: IcoFaceid16,
    },
    {
      label: 'Option 2',
      value: 'option-2',
      IconComponent: IcoFingerprint16,
    },
    {
      label: 'Option 3',
      value: 'option-3',
    },
  ],
  value: 'option-1',
};
