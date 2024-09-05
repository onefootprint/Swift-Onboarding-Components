import { IcoDotsHorizontal16 } from '@onefootprint/icons';
import type { Meta, StoryFn } from '@storybook/react';
import Stack from '../stack';
import Dropdown from './dropdown';
import type { TriggerProps } from './dropdown.types';

export default {
  title: 'Components/Dropdown',
  component: Dropdown.Trigger,
} as Meta;

const Template: StoryFn<TriggerProps> = ({ children, ...args }) => (
  <Stack width="100vw" height="100vh" alignItems="center" justifyContent="center">
    <Dropdown.Root>
      <Dropdown.Trigger {...args}>{children}</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Group>
          <Dropdown.Item>Item 1</Dropdown.Item>
          <Dropdown.Item>Item 2</Dropdown.Item>
          <Dropdown.Item>Item 3</Dropdown.Item>
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown.Root>
  </Stack>
);

const DotsContainer = () => (
  <Stack width="24px" height="24px" alignItems="center" justifyContent="center">
    <IcoDotsHorizontal16 />
  </Stack>
);

export const DefaultTrigger = Template.bind({});
DefaultTrigger.args = {
  children: 'Default Trigger',
  variant: 'default',
};

export const ChevronTrigger = Template.bind({});
ChevronTrigger.args = {
  children: 'Chevron Trigger',
  variant: 'chevron',
};

export const IconTrigger = Template.bind({});
IconTrigger.args = {
  children: <DotsContainer />,
  variant: 'icon',
};
