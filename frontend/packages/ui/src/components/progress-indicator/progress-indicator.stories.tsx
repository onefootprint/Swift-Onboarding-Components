import { Meta, Story } from '@storybook/react';
import React from 'react';

import ProgressIndicator, {
  ProgressIndicatorProps,
} from './progress-indicator';

export default {
  component: ProgressIndicator,
  title: 'Components/ProgressIndicator',
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

const Template: Story<ProgressIndicatorProps> = ({
  max,
  value,
}: ProgressIndicatorProps) => <ProgressIndicator max={max} value={value} />;

export const Base = Template.bind({});
Base.args = {
  max: 5,
  value: 3,
};
