import type { Meta, StoryFn } from '@storybook/react';

import type { AvatarProps } from './avatar';
import Avatar from './avatar';

export default {
  component: Avatar,
  title: 'Components/Avatar',
  argTypes: {
    name: {
      control: 'text',
      description: 'Name of the avatar. Uses the first letter when src is not provided',
      required: true,
    },
    size: {
      control: 'select',
      description: 'Avatar size',
      options: ['default', 'compact', 'large', 'xlarge'],
    },
    src: {
      control: 'text',
      description: 'Avatar image source | component meant to be used with company logos',
      required: false,
    },
    loading: {
      control: 'boolean',
      description: 'Shows a loading state',
      required: false,
    },
  },
} as Meta;

const Template: StoryFn<AvatarProps> = ({ loading, name, size, src }: AvatarProps) => (
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
  src: 'https://cdn.cdnlogo.com/logos/g/77/grampus-eight.svg',
  loading: false,
};
