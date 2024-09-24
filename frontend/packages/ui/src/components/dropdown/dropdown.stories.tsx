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
          <Dropdown.GroupTitle>Group 1</Dropdown.GroupTitle>
          <Dropdown.Item>Item 1</Dropdown.Item>
          <Dropdown.Item>Item 2</Dropdown.Item>
          <Dropdown.Item>Item 3</Dropdown.Item>
        </Dropdown.Group>
        <Dropdown.Divider />
        <Dropdown.Group>
          <Dropdown.GroupTitle>Group 2</Dropdown.GroupTitle>
          <Dropdown.Item>Item 4</Dropdown.Item>
          <Dropdown.Item>Item 5</Dropdown.Item>
          <Dropdown.Item>Item 6</Dropdown.Item>
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown.Root>
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
