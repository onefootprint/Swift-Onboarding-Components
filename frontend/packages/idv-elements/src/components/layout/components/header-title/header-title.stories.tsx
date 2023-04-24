import { Meta, Story } from '@storybook/react';
import React from 'react';

import HeaderTitle, { HeaderTitleProps } from './header-title';

export default {
  component: HeaderTitle,
  title: 'Components/HeaderTitle',
  argTypes: {
    title: {
      control: 'text',
      description: 'Title text',
      required: true,
    },
    subtitle: {
      control: 'text',
      description: 'Subtitle text',
      required: true,
    },
  },
} as Meta;

const Template: Story<HeaderTitleProps> = ({
  title,
  subtitle,
}: HeaderTitleProps) => <HeaderTitle title={title} subtitle={subtitle} />;

export const Base = Template.bind({});
Base.args = {
  title: 'Title',
  subtitle: 'Subtitle',
};
