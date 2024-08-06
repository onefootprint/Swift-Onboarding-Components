import type { ComponentMeta, Story } from '@storybook/react';
import { useState } from 'react';

import Filter from './filters';

export default {
  title: 'Patterns/Filters',
  component: Filter,
  argTypes: {},
} as ComponentMeta<typeof Filter>;

const defaultFilters: {
  statuses: [];
  attributes: [];
  dateRange: [];
  watchlist_hit?: string;
} = {
  statuses: [],
  attributes: [],
  dateRange: [],
  watchlist_hit: undefined,
};

const Template: Story = ({ onClear, onChange }) => {
  const [filters, setFilters] = useState(defaultFilters);

  return (
    <Filter
      controls={[
        {
          query: 'statuses',
          label: 'Status',
          kind: 'multi-select',
          options: [
            { label: 'Verified', value: 'verified' },
            { label: 'Failed', value: 'failed' },
            { label: 'Review required', value: 'review_required' },
            { label: 'Id required', value: 'id_required' },
          ],
          selectedOptions: filters.statuses,
        },
        {
          query: 'attributes',
          label: 'Data Attribute',
          kind: 'multi-select-grouped',
          options: [
            {
              label: 'Basic Data',
              options: [
                { label: 'Full name', value: 'full_name' },
                { label: 'Email', value: 'email' },
                { label: 'Phone number', value: 'phone_number' },
              ],
            },
            {
              label: 'Identity Data',
              options: [
                { label: 'SSN', value: 'ssn' },
                { label: 'Date of Birth', value: 'dob' },
              ],
            },
            {
              label: 'Address',
              options: [
                { label: 'Country', value: 'country' },
                { label: 'Address line 1', value: 'address_line_1' },
                { label: 'Address line 2', value: 'address_line_2' },
                { label: 'City', value: 'city' },
                { label: 'Zip code', value: 'zip_code' },
                { label: 'State', value: 'state' },
              ],
            },
          ],
          selectedOptions: filters.attributes,
        },
        {
          query: 'dateRange',
          label: 'Date',
          kind: 'date',
          selectedOptions: filters.dateRange,
        },
        {
          query: 'watchlist_hit',
          label: 'On a watchlist',
          kind: 'single-select',
          options: [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ],
          selectedOptions: filters.watchlist_hit,
        },
      ]}
      onClear={() => {
        setFilters(defaultFilters);
        onClear?.();
      }}
      onChange={(query, newOptions) => {
        setFilters(prevFilters => ({
          ...prevFilters,
          [query]: newOptions,
        }));
        onChange?.(query, newOptions);
      }}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  onChange: (query: string, newOptions: string[]) => {
    console.log('changed', { query, newOptions }); // eslint-disable-line no-console
  },
  onClear: () => {
    console.log('clear'); // eslint-disable-line no-console
  },
};
