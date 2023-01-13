import { Meta, Story } from '@storybook/react';
import React from 'react';

import Avatar, { AvatarProps } from './avatar';

export default {
  component: Avatar,
  title: 'Components/Avatar',
  argTypes: {
    name: {
      control: 'text',
      description:
        'Name of the avatar. Uses the first letter when src is not provided',
      required: true,
    },
    size: {
      control: 'select',
      description: 'Avatar size',
      options: ['default', 'compact', 'large'],
    },
    src: {
      control: 'text',
      description: 'Avatar image source',
      required: false,
    },
  },
} as Meta;

const Template: Story<AvatarProps> = ({ src, name, size }: AvatarProps) => (
  <Avatar src={src} name={name} size={size} />
);

export const Base = Template.bind({});
Base.args = {
  name: 'Jane Doe',
  size: 'default',
};

export const WithImage = Template.bind({});
WithImage.args = {
  name: 'Jane Doe',
  size: 'default',
  src: 'https://i.pravatar.cc/150?img=35',
};
