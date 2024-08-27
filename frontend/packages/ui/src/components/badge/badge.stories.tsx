import type { Meta, StoryFn } from '@storybook/react';

import type { BadgeProps } from './badge';
import Badge from './badge';

export default {
  component: Badge,
  title: 'Components/Badge',
  argTypes: {
    children: {
      control: 'text',
      description: 'Content to be rendered',
      required: true,
    },
    variant: {
      control: 'select',
      description: 'Intent of the badge',
      options: ['success', 'info', 'error', 'neutral', 'warning'],
      required: true,
    },
  },
} as Meta;

const Template: StoryFn<BadgeProps> = ({ children, variant, testID }: BadgeProps) => (
  <Badge variant={variant} testID={testID}>
    {children}
  </Badge>
);

export const Base = Template.bind({});
Base.args = {
  children: 'Success',
  testID: 'badge-test-id',
  variant: 'success',
};
