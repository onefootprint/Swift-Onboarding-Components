import { ComponentMeta, Story } from '@storybook/react';
import { IcoCode16, IcoFileText16, IcoSettings16 } from 'icons';
import React from 'react';

import { Tab, TabListProps, Tabs } from '.';

export default {
  title: 'Components/Tabs',
  component: Tabs,
  argTypes: {
    children: {
      description: 'Tab items',
      name: 'children *',
    },
    variant: {
      control: 'select',
      options: ['pill', 'underlined'],
    },
  },
} as ComponentMeta<typeof Tabs>;

const Template: Story<TabListProps> = ({ variant }: TabListProps) => (
  <Tabs variant={variant}>
    <Tab href="/ipsum" selected as="button" onClick={console.log}>
      <IcoFileText16 />
      Security logs
    </Tab>
    <Tab href="/dolor" as="button" onClick={console.log}>
      <IcoCode16 />
      Developers
    </Tab>
    <Tab href="/dolor" as="button" onClick={console.log}>
      <IcoSettings16 />
      Settings
    </Tab>
  </Tabs>
);

export const Base = Template.bind({});
Base.args = {
  variant: 'pill',
};
