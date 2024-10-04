import type { Meta, StoryObj } from '@storybook/react';
import Stack from '../stack';
import Text from '../text';

import Button from '../button';
import Popover from './popover';

export default {
  title: 'Components/Popover',
} satisfies Meta<typeof Popover.Root>;

type Story = StoryObj<typeof Popover.Root>;

const Template: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger>
        <Button variant="secondary" size="compact" type="button">
          Click to Open Popover
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content>
          <Stack direction="column" gap={2} padding={3}>
            <Text variant="label-3">This content appears on click</Text>
          </Stack>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  ),
};

export const Default: Story = {
  ...Template,
};

export const TextTrigger: Story = {
  ...Template,
  render: () => (
    <Popover.Root>
      <Popover.Trigger>
        <Text variant="label-3">Click to Open Popover</Text>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content>
          <Stack direction="column" gap={2} padding={3}>
            <Text variant="body-3">This content appears on click</Text>
          </Stack>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  ),
};
