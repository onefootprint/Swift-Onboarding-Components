import type { Meta, StoryFn } from '@storybook/react';

import type { TabsProps } from '.';
import { Tabs } from '.';
import type { TabOption } from './tabs';

export default {
  title: 'Components/Tabs',
  component: Tabs,
  argTypes: {},
} satisfies Meta<typeof Tabs>;

const options: TabOption[] = [
  { label: 'Security logs', value: '/security-logs' },
  { label: 'Developers', value: '/developers' },
  { label: 'Settings', value: '/settings' },
];

const Template: StoryFn<TabsProps> = () => <Tabs options={options} onChange={value => console.log(value)} />;

export const Base = Template.bind({});
Base.args = {};
