import type { Meta, StoryFn } from '@storybook/react';

import type { DividerProps } from './divider';
import Divider from './divider';

export default {
  title: 'Components/Divider',
  component: Divider,
  argTypes: {
    variant: {
      control: 'select',
      description: 'Divider variant',
      options: ['primary', 'secondary'],
      required: true,
    },
  },
} satisfies Meta<typeof Divider>;

const Template: StoryFn<DividerProps> = ({ variant }: DividerProps) => <Divider variant={variant} />;

export const Default = Template.bind({});
Default.args = {
  variant: 'primary',
};
