import { Meta, Story } from '@storybook/react';
import React from 'react';

import Divider from './divider';

export default {
  component: Divider,
  title: 'Components/Divider',
} as Meta;

const Template: Story = () => <Divider />;

export const Base = Template.bind({});
Base.args = {};
