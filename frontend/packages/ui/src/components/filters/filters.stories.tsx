import { ComponentMeta, Story } from '@storybook/react';
import React, { useState } from 'react';

import Filter from './filters';

export default {
  title: 'Patterns/Filters',
  component: Filter,
  argTypes: {
    children: {
      control: 'text',
      description: 'Content to be rendered within the component',
      name: 'Children *',
      required: true,
    },
    as: {
      control: 'select',
      options: ['div', 'section', 'article', 'main'],
      table: { defaultValue: { summary: 'div' } },
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as ComponentMeta<typeof Filter>;

const Template: Story = () => {
  const [filters, setFilters] = useState<{
    statuses: string[];
    attributes: [];
  }>({
    statuses: [],
    attributes: [],
  });

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
                { label: 'Phone Number', value: 'phone_number' },
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
      ]}
      onChange={(query, options) => {
        setFilters(prevFilters => ({
          ...prevFilters,
          [query]: options,
        }));
      }}
    />
  );
};

export const Base = Template.bind({});
Base.args = {};
