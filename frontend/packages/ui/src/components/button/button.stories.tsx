import React from 'react';
import { Story, ComponentMeta } from '@storybook/react';

import Button, { ButtonProps } from './button';

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof Button>;

const Template: Story<ButtonProps> = ({ children }: ButtonProps) => (
  <Button>{children}</Button>
);
export const Primary = Template.bind({});
Primary.args = {
  children: 'This is a button',
};
