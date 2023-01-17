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
    loading: {
      control: 'boolean',
      description: 'Shows a loading state',
      required: false,
    },
  },
} as Meta;

const Template: Story<AvatarProps> = ({
  loading,
  name,
  size,
  src,
}: AvatarProps) => (
  <Avatar loading={loading} name={name} size={size} src={src} />
);

export const Base = Template.bind({});
Base.args = {
  name: 'Jane Doe',
  size: 'default',
  loading: false,
};

export const WithImage = Template.bind({});
WithImage.args = {
  name: 'Jane Doe',
  size: 'default',
  src: 'https://i.pravatar.cc/150?img=35',
  loading: false,
};
