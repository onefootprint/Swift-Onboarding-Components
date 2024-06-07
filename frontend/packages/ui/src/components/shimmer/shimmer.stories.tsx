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

const Template: Story<ShimmerProps> = ({ 'aria-valuetext': ariaValueText, testID }: ShimmerProps) => (
  <Shimmer testID={testID} aria-valuetext={ariaValueText} />
);

export const Base = Template.bind({});
Base.args = {
  'aria-valuetext': 'Loading...',
  testID: 'shimmer-test-id',
};
