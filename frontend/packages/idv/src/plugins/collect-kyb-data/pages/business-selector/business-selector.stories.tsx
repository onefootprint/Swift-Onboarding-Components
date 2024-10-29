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
      { id: '1', name: 'Spark Technologies Inc.' },
      { id: '2', name: 'Lightning Technologies Inc.' },
    ],
  },
} satisfies Meta<typeof BusinessSelector>;

export const Basic: StoryFn = () => (
  <Template
    businesses={[
      { id: '1', name: 'Spark Technologies Inc.' },
      { id: '2', name: 'Lightning Technologies Inc.' },
    ]}
    onAddNew={console.log}
    onSelect={console.log}
  />
);
