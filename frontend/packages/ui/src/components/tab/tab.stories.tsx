import { ComponentMeta, Story } from '@storybook/react';
import { IcoCode16, IcoFileText16, IcoSettings16, IcoUsers16 } from 'icons';
import React from 'react';

import Tab, { TabListProps } from '.';

export default {
  title: 'Components/Tabs',
  component: Tab.List,
  argTypes: {
    children: {
      description: 'Tab items',
      name: 'children *',
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as ComponentMeta<typeof Tab.List>;

const Template: Story<TabListProps> = () => (
  <Tab.List>
    <Tab.Item href="/lorem" selected iconComponent={IcoUsers16}>
      Users
    </Tab.Item>
    <Tab.Item href="/ipsum" iconComponent={IcoFileText16}>
      Security logs
    </Tab.Item>
    <Tab.Item href="/dolor" iconComponent={IcoCode16}>
      Developers
    </Tab.Item>
    <Tab.Item href="/dolor" iconComponent={IcoSettings16}>
      Settings
    </Tab.Item>
  </Tab.List>
);

export const Base = Template.bind({});
Base.args = {};
