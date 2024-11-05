import { fn } from '@onefootprint/storybook-utils';
import type { Meta, StoryObj } from '@storybook/react';
import NewBusinessIntroduction from './new-business-introduction';

const meta: Meta<typeof NewBusinessIntroduction> = {
  component: NewBusinessIntroduction,
  title: 'NewBusinessIntroduction',
};

type Story = StoryObj<typeof NewBusinessIntroduction>;

export const Basic: Story = {
  args: {
    onDone: fn(),
  },
};

export default meta;
