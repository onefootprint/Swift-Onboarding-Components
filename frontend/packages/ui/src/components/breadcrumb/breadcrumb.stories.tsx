import type { Meta, Story } from '@storybook/react';
import React from 'react';

import type { BreadcrumbProps } from './breadcrumb';
import Breadcrumb from './breadcrumb';
import BreadcrumbItem from './breadcrumb-item';

export default {
  component: Breadcrumb,
  title: 'Components/Breadcrumb',
  argTypes: {
    separator: {
      control: 'text',
      description: 'Custom separator node',
    },
    'aria-label': {
      control: 'text',
      description: 'Custom separator node',
    },
  },
} as Meta;

const Template: Story<BreadcrumbProps> = ({ separator, 'aria-label': ariaLabel }: BreadcrumbProps) => (
  <Breadcrumb separator={separator} aria-label={ariaLabel}>
    <BreadcrumbItem href="#">Footprint</BreadcrumbItem>
    <BreadcrumbItem href="#">UI</BreadcrumbItem>
    <BreadcrumbItem>Breadcrumb</BreadcrumbItem>
  </Breadcrumb>
);

export const Base = Template.bind({});
Base.args = {
  separator: '/',
  'aria-label': 'breadcrumb',
};
