import type { Meta, Story } from '@storybook/react';
import React from 'react';
import Button from '../button';
import Stack from '../stack';
import Text from '../text';
import Popover from './popover';
import type { PopoverProps } from './popover';

export default {
  component: Popover,
  title: 'Components/Popover',
  argTypes: {
    content: {
      control: 'text',
      description: 'The content of the popover',
      table: {
        type: { summary: 'ReactNode', required: true },
      },
    },
    trigger: {
      control: 'text',
      description: 'The trigger element for the popover',
      table: {
        type: { summary: 'ReactNode', required: true },
      },
    },
  },
} as Meta<typeof Popover>;

const PopoverContent = () => {
  return (
    <Stack direction="column">
      <Text variant="label-3">Popover content</Text>
      <Text variant="body-3">Popover content</Text>
    </Stack>
  );
};

const Template: Story<PopoverProps> = () => {
  return (
    <Stack justify="center" align="center" width="100vw" height="100vh">
      <Popover content={<PopoverContent />}>
        <Text variant="body-4">Open Popover</Text>
      </Popover>
    </Stack>
  );
};

export const Default = Template.bind({});
Default.args = {};
