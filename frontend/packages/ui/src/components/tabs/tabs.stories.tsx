import type { ComponentMeta, Story } from '@storybook/react';
import React from 'react';

import type { TabsProps } from '.';
import { Tabs } from '.';
import type { TabOption } from './tabs';

export default {
  title: 'Components/Tabs',
  component: Tabs,
  argTypes: {
    children: {
      description: 'Tab items',
      name: 'children *',
    },
  },
} as ComponentMeta<typeof Tabs>;

const options: TabOption[] = [
  { label: 'Security logs', value: '/security-logs' },
  { label: 'Developers', value: '/developers' },
  { label: 'Settings', value: '/settings' },
];

const Template: Story<TabsProps> = () => (
  <Tabs options={options} onChange={value => console.log(value)} />
);

export const Base = Template.bind({});
Base.args = {};
