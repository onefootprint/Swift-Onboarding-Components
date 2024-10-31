import { fn } from '@onefootprint/storybook-utils';
import type { Meta, StoryFn } from '@storybook/react';
import BusinessSelector, { type BusinessSelectorProps } from './business-selector';

const Template: StoryFn<BusinessSelectorProps> = ({ businesses, onSelect, onAddNew }) => {
  return <BusinessSelector businesses={businesses} onSelect={onSelect} onAddNew={onAddNew} />;
};

export default {
  component: BusinessSelector,
  title: 'BusinessSelector',
  args: {
    onSelect: fn(),
    onAddNew: fn(),
    businesses: [
      {
        id: '1',
        name: 'Spark Technologies Inc.',
        createdAt: '2023-08-15T09:23:41.123Z',
        lastActivityAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        isIncomplete: true,
      },
      {
        id: '2',
        name: 'Lightning Technologies Inc.',
        createdAt: '2024-01-03T16:45:12.987Z',
        lastActivityAt: '2024-01-03T16:45:12.987Z',
        isIncomplete: false,
      },
    ],
  },
} satisfies Meta<typeof BusinessSelector>;

export const Basic: StoryFn = () => (
  <Template
    businesses={[
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
    ]}
    onAddNew={console.log}
    onSelect={console.log}
  />
);
