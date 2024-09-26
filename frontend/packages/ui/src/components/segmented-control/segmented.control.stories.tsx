import type { Meta, StoryFn } from '@storybook/react';
import React, { useEffect } from 'react';

import type { SegmentedControlProps } from './segmented-control';
import SegmentedControl from './segmented-control';

const twoOptions = [
  { label: 'Option 1', value: 'option-1' },
  { label: 'Option 2', value: 'option-2' },
];

const threeOptions = [
  { label: 'Option 1', value: 'option-1' },
  { label: 'Option 2', value: 'option-2' },
  { label: 'Option 3', value: 'option-3' },
];

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
      control: 'select',
      options: ['Two options', 'Three options'],
      mapping: {
        'Two options': twoOptions,
        'Three options': threeOptions,
      },
      description: 'Choose between two or three options',
      required: true,
    },
    size: {
      control: 'select',
      options: ['compact', 'default'],
      description: 'Size of the segmented control',
      required: true,
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Variant of the segmented control',
      required: true,
    },
    value: {
      control: 'select',
      options: ['Option 1', 'Option 2', 'Option 3'],
      mapping: {
        'Option 1': 'option-1',
        'Option 2': 'option-2',
        // No easy way to hide this, which will be an invalid option if we only have two options. Will fail silently, though, so no worries
        'Option 3': 'option-3',
      },
      description: 'Value of the selected option',
      required: true,
    },
  },
} satisfies Meta<typeof SegmentedControl>;

const Template: StoryFn<SegmentedControlProps> = ({
  'aria-label': ariaLabel,
  onChange,
  options,
  size,
  variant,
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

  return (
    <SegmentedControl
      aria-label={ariaLabel}
      onChange={handleChange}
      options={options}
      size={size}
      variant={variant}
      value={segment}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  'aria-label': 'Segmented Control',
  onChange: console.log, // eslint-disable-line no-console
  options: twoOptions,
  value: 'option-1',
};
