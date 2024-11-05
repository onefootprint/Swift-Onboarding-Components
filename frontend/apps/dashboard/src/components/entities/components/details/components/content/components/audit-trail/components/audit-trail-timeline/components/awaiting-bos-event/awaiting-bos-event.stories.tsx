import type { Meta, StoryObj } from '@storybook/react';
import AwaitingBosEvent from './awaiting-bos-event';

const meta: Meta<typeof AwaitingBosEvent> = {
  component: AwaitingBosEvent,
  title: 'AwaitingBosEvent',
};

type Story = StoryObj<typeof AwaitingBosEvent>;

export const Basic: Story = {
  args: {},
};

export default meta;
