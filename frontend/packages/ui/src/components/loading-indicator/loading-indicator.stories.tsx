import { ComponentMeta, Story } from '@storybook/react';
import React from 'react';

import light from '../../config/themes/light';
import LoadingIndicator, { LoadingIndicatorProps } from './loading-indicator';

export default {
  component: LoadingIndicator,
  title: 'Components/LoadingIndicator',
  argTypes: {
    size: {
      control: 'select',
      description: 'Size of the loading',
      options: ['default', 'compact'],
      table: { defaultValue: { summary: 'default' } },
    },
    color: {
      control: 'select',
      description: 'Color of the icon',
      options: Object.keys(light.colors),
      table: { defaultValue: { summary: 'primary' } },
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as ComponentMeta<typeof LoadingIndicator>;

const Template: Story<LoadingIndicatorProps> = ({
  color,
  size,
  testID,
}: LoadingIndicatorProps) => (
  <LoadingIndicator color={color} size={size} testID={testID} />
);

export const Base = Template.bind({});
Base.args = {
  color: 'primary',
  size: 'default',
  testID: 'loading-indicator-test-id',
};
