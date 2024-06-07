import type { ComponentMeta, Story } from '@storybook/react';
import React from 'react';

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
} as ComponentMeta<typeof Divider>;

const Template: Story<DividerProps> = ({ variant }: DividerProps) => <Divider variant={variant} />;

export const Default = Template.bind({});
Default.args = {
  variant: 'primary',
};
