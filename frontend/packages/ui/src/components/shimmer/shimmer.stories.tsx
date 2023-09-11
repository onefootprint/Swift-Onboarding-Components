import type { Meta, Story } from '@storybook/react';
import React from 'react';

import type { ShimmerProps } from './shimmer';
import Shimmer from './shimmer';

export default {
  component: Shimmer,
  title: 'Components/Shimmer',
  argTypes: {
    testID: {
      control: 'text',
      table: {
        type: { summary: 'string', required: false },
      },
      description: 'Append an attribute data-testid for testing purposes',
    },
    sx: {
      control: 'object',
      table: {
        type: { summary: 'object', required: false },
      },
      description: 'SX property for style',
    },
    'aria-valuetext': {
      control: 'text',
      table: {
        type: { summary: 'string', required: false },
        defaultValue: { summary: 'Loading...' },
      },
      description: 'For accessibility',
    },
  },
} as Meta;

const Template: Story<ShimmerProps> = ({
  'aria-valuetext': ariaValueText,
  sx,
  testID,
}: ShimmerProps) => (
  <Shimmer sx={sx} testID={testID} aria-valuetext={ariaValueText} />
);

export const Base = Template.bind({});
Base.args = {
  'aria-valuetext': 'Loading...',
  sx: {
    width: '100%',
    height: '60px',
  },
  testID: 'shimmer-test-id',
};
