import { ComponentMeta, Story } from '@storybook/react';
import React from 'react';

import MultiSelect, { MultiSelectProps } from './multi-select';

export const defaultOptions = [
  {
    label: 'Basic Data',
    options: [
      { value: 'full_name', label: 'Full name' },
      { value: 'email', label: 'Email' },
      { value: 'phone_number', label: 'Phone number' },
    ],
  },
  {
    label: 'Identity data',
    options: [
      { value: 'ssn_9', label: 'SSN (Full)' },
      { value: 'ssn_4', label: 'SSN (Last 4)' },
      { value: 'dob', label: 'Date of birth' },
    ],
  },
  {
    label: 'Address data',
    options: [
      { value: 'address_line_1', label: 'Address line 1' },
      { value: 'address_line_2', label: 'Address line 2' },
      { value: 'city', label: 'City' },
      { value: 'state', label: 'State' },
      { value: 'zip', label: 'Zip code' },
      { value: 'country', label: 'Country' },
    ],
  },
];

export default {
  component: MultiSelect,
  title: 'Components/MultiSelect',
  argTypes: {
    autoFocus: {
      control: 'boolean',
      description: 'Auto focus the multi-select',
    },
    defaultValue: {
      control: 'array',
      description: 'Default value of the multi-select',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the multi-select',
    },
    emptyStateText: {
      control: 'text',
      description: 'Text to show when there are no options',
    },
    id: {
      control: 'text',
      description: 'ID of the multi-select',
    },
    label: {
      control: 'text',
      description: 'Label of the multi-select',
    },
    name: {
      control: 'text',
      description: 'Name of the multi-select',
    },
    onBlur: {
      control: 'function',
      description: 'Callback when the multi-select is blurred',
    },
    onChange: {
      control: 'function',
      description: 'Callback when the multi-select value changes',
    },
    onFocus: {
      control: 'function',
      description: 'Callback when the multi-select is focused',
    },
    onInputChange: {
      control: 'function',
      description: 'Callback when the multi-select input changes',
    },
    options: {
      control: 'array',
      description: 'Options of the multi-select',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder of the multi-select',
    },
    required: {
      control: 'boolean',
      description: 'Mark the multi-select as required',
    },
    value: {
      control: 'optio',
      description: 'Value of the multi-select',
    },
    size: {
      control: 'select',
      options: ['default', 'compact'],
      description: 'Size of the multi-select',
    },
  },
} as ComponentMeta<typeof MultiSelect>;

type Option = {
  label: string;
  value: string;
};

type Group = {
  options: readonly Option[];
  label?: string;
};

const Template: Story<MultiSelectProps<Option, Group>> = ({
  autoFocus,
  defaultValue,
  disabled,
  emptyStateText,
  id,
  label,
  name,
  onBlur,
  onChange,
  onFocus,
  onInputChange,
  options,
  placeholder,
  required,
  size,
  value,
}: MultiSelectProps<Option, Group>) => (
  <MultiSelect
    autoFocus={autoFocus}
    defaultValue={defaultValue}
    disabled={disabled}
    emptyStateText={emptyStateText}
    id={id}
    label={label}
    name={name}
    onBlur={onBlur}
    onChange={onChange}
    onFocus={onFocus}
    onInputChange={onInputChange}
    options={options}
    placeholder={placeholder}
    required={required}
    size={size}
    value={value}
  />
);

export const Base = Template.bind({});
Base.args = {
  autoFocus: false,
  defaultValue: undefined,
  disabled: false,
  emptyStateText: 'No results found',
  id: 'multi-select-id',
  label: 'Permissible attributes',
  name: 'multi-select',
  onBlur: console.log,
  onChange: console.log,
  onFocus: console.log,
  onInputChange: console.log,
  options: defaultOptions,
  placeholder: 'Select...',
  required: false,
  size: 'default',
  value: undefined,
};
