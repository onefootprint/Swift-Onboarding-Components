import themes from '@onefootprint/design-tokens';
import type { ComponentMeta, Story } from '@storybook/react';
import React from 'react';

import type { LoadingIndicatorProps } from './loading-indicator';
import LoadingIndicator from './loading-indicator';

export default {
  component: LoadingIndicator,
  title: 'Components/LoadingIndicator',
  argTypes: {
    'aria-label': {
      control: 'string',
      description:
        'The accessible, human friendly label to use for screen readers.',
      table: { required: false, defaultValue: { summary: '-' } },
    },
    size: {
      control: 'select',
      description: 'Size of the loading',
      options: ['default', 'compact'],
      table: { defaultValue: { summary: 'default' } },
    },
    color: {
      control: 'select',
      description: 'Color of the icon',
      options: Object.keys(themes.light.color),
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
