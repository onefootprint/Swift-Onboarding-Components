import type { Meta, Story } from '@storybook/react';
import React from 'react';

import type { BannerProps } from './banner';
import Banner from './banner';

export default {
  component: Banner,
  title: 'Components/Banner',
  argTypes: {
    children: {
      control: 'text',
      description: 'Content to be rendered',
      required: true,
    },
    variant: {
      control: 'select',
      description: 'Intent of the Banner',
      options: ['info', 'error', 'warning', 'announcement'],
      required: true,
    },
  },
} as Meta;

const Template: Story<BannerProps> = ({
  children,
  variant: $variant,
}: BannerProps) => <Banner variant={$variant}>{children}</Banner>;

export const Base = Template.bind({});
Base.args = {
  children: 'Critical message goes here.',
  variant: 'error',
};

export const Warning = Template.bind({});
Warning.args = {
  children: 'Warning message goes here.',
  variant: 'warning',
};

export const Info = Template.bind({});
Info.args = {
  children: 'Info message goes here.',
  variant: 'info',
};

export const Announcement = Template.bind({});
Announcement.args = {
  children: 'Announcement message goes here.',
  variant: 'announcement',
};

export const WithLink = Template.bind({});
WithLink.args = {
  children: (
    <>
      Critical message goes here. <a href="/">Link</a>
    </>
  ),
  variant: 'error',
};
