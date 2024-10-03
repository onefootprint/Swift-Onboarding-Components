import { IcoDotsHorizontal16 } from '@onefootprint/icons';
import type { Meta, StoryFn } from '@storybook/react';
import IconButton from '../icon-button';
import Stack from '../stack';
import Dropdown from './dropdown';
import type { TriggerProps } from './dropdown.types';

export default {
  title: 'Components/Dropdown',
  component: Dropdown.Trigger,
} as Meta;

const DefaultTemplate: StoryFn<TriggerProps> = ({ children, ...args }) => (
  <Stack width="100vw" height="100vh" alignItems="center" justifyContent="center">
    <Dropdown.Root>
      <Dropdown.Trigger {...args}>{children}</Dropdown.Trigger>
      <Dropdown.Portal>
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
      </Dropdown.Portal>
    </Dropdown.Root>
  </Stack>
);

const IconButtonTemplate: StoryFn<TriggerProps> = args => (
  <Stack width="100vw" height="100vh" alignItems="center" justifyContent="center">
    <Dropdown.Root>
      <Dropdown.Trigger asChild {...args}>
        <IconButton aria-label="Open Dropdown">
          <IcoDotsHorizontal16 />
        </IconButton>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content>
          <Dropdown.Item>Item 1</Dropdown.Item>
          <Dropdown.Item>Item 2</Dropdown.Item>
          <Dropdown.Item>Item 3</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  </Stack>
);

const ChevronIconTemplate: StoryFn<TriggerProps> = ({ children, ...args }) => (
  <Stack width="100vw" height="100vh" alignItems="center" justifyContent="center">
    <Dropdown.Root>
      <Dropdown.Trigger {...args}>{children}</Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content>
          <Dropdown.Item>Item 1</Dropdown.Item>
          <Dropdown.Item>Item 2</Dropdown.Item>
          <Dropdown.Item>Item 3</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  </Stack>
);

export const DefaultTrigger = DefaultTemplate.bind({});
DefaultTrigger.args = {
  children: 'Default Trigger',
};

export const IconButtonTrigger = IconButtonTemplate.bind({});

export const ChevronTrigger = ChevronIconTemplate.bind({});
ChevronTrigger.args = {
  children: 'Chevron Trigger',
};
