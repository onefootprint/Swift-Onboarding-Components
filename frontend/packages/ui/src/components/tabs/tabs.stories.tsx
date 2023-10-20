import type { ComponentMeta, Story } from '@storybook/react';
import React from 'react';

import type { TabsProps } from '.';
import { Tab, Tabs } from '.';

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

const Template: Story<TabsProps> = () => (
  <Tabs>
    <Tab href="/ipsum" selected as="button" onClick={console.log}>
      Security logs
    </Tab>
    <Tab href="/dolor" as="button" onClick={console.log}>
      Developers
    </Tab>
    <Tab href="/dolor" as="button" onClick={console.log}>
      Settings
    </Tab>
  </Tabs>
);

export const Base = Template.bind({});
Base.args = {};
