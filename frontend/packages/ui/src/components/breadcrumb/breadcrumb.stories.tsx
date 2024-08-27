import type { Meta, StoryFn } from '@storybook/react';

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

const Template: StoryFn<BreadcrumbProps> = ({ separator, 'aria-label': ariaLabel }: BreadcrumbProps) => (
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
