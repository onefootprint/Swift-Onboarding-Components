import { Meta, Story } from '@storybook/react';
import React from 'react';

import InlineBanner, { InlineBannerProps } from './inline-banner';

export default {
  component: InlineBanner,
  title: 'Components/InlineBanner',
  argTypes: {
    children: {
      control: 'text',
      description: 'Content to be rendered',
      required: true,
    },
    variant: {
      control: 'select',
      description: 'Intent of the Inline Banner',
      options: ['info', 'error', 'warning'],
      required: true,
    },
  },
} as Meta;

const Template: Story<InlineBannerProps> = ({
  children,
  variant,
}: InlineBannerProps) => (
  <InlineBanner variant={variant}>{children}</InlineBanner>
);

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
