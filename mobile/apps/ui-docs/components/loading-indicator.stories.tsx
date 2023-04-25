import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react-native';
import { LoadingIndicator } from '@onefootprint/ui';
import themes from '@onefootprint/design-tokens';

const LoadingIndicatorMeta: ComponentMeta<typeof LoadingIndicator> = {
  title: 'LoadingIndicator',
  component: LoadingIndicator,
  argTypes: {
    'aria-label': {
      control: 'text',
    },
    color: {
      control: 'select',
      options: Object.keys(themes.light.color),
    },
  },
  args: {
    'aria-label': 'Loading...',
    color: 'primary',
  },
};

export default LoadingIndicatorMeta;

type LoadingIndicatorStory = ComponentStory<typeof LoadingIndicator>;

export const Basic: LoadingIndicatorStory = args => (
  <LoadingIndicator {...args} />
);
