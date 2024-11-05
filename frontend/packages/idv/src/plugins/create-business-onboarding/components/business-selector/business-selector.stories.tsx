import { fn } from '@onefootprint/storybook-utils';
import type { Meta, StoryObj } from '@storybook/react';
import BusinessSelector from './business-selector';

const meta: Meta<typeof BusinessSelector> = {
  component: BusinessSelector,
  title: 'BusinessSelector',
};

type Story = StoryObj<typeof BusinessSelector>;

export const Basic: Story = {
  args: {
    businesses: [
      {
        id: '1',
        name: 'Spark Technologies Inc.',
        createdAt: '2023-11-28T14:32:18.456Z',
        lastActivityAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        isIncomplete: false,
      },
      {
        id: '2',
        name: 'Lightning Technologies Inc.',
        createdAt: '2024-02-17T08:12:55.789Z',
        lastActivityAt: '2024-02-17T08:12:55.789Z',
        isIncomplete: true,
      },
    ],
    onAddNew: fn(),
    onSelect: fn(),
  },
};

export default meta;
