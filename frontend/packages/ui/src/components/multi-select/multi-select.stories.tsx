import type { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import type { MultiSelectProps } from './multi-select';
import MultiSelect from './multi-select';

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
      { value: 'ssn_9', label: 'SSN' },
      { value: 'ssn_4', label: 'SSN (last 4)' },
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
      control: 'select',
      options: ['1', '2'],
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
      type: 'function',
      description: 'Callback when the multi-select is blurred',
    },
    onChange: {
      type: 'function',
      description: 'Callback when the multi-select value changes',
    },
    onFocus: {
      type: 'function',
      description: 'Callback when the multi-select is focused',
    },
    onInputChange: {
      type: 'function',
      description: 'Callback when the multi-select input changes',
    },
    options: {
      control: 'select',
      options: ['1', '2'],
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
    hasError: {
      control: 'boolean',
      description: 'Gives an error state to the input and hint',
    },
    hint: {
      control: 'text',
      description: 'Display an informative text below',
      required: false,
    },
    value: {
      control: 'text',
      description: 'Value of the multi-select',
    },
    size: {
      control: 'select',
      options: ['default', 'compact'],
      description: 'Size of the multi-select',
    },
  },
} satisfies Meta<typeof MultiSelect>;

type Option = {
  label: string;
  value: string;
};

type Group = {
  options: readonly Option[];
  label?: string;
};

const Template: StoryFn<MultiSelectProps<Option, Group>> = ({
  autoFocus,
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
  hasError,
  hint,
  size,
}: MultiSelectProps<Option, Group>) => {
  const [value, setValue] = React.useState<readonly Option[]>([]);
  return (
    <MultiSelect
      autoFocus={autoFocus}
      disabled={disabled}
      emptyStateText={emptyStateText}
      id={id}
      label={label}
      name={name}
      onBlur={onBlur}
      onFocus={onFocus}
      onInputChange={onInputChange}
      options={options}
      placeholder={placeholder}
      required={required}
      hasError={hasError}
      hint={hint}
      size={size}
      value={value}
      onChange={(newOptions: readonly Option[], meta) => {
        setValue(newOptions);
        onChange?.(newOptions, meta);
      }}
      allOption={{
        label: 'Everything',
        value: 'all',
      }}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  autoFocus: false,
  defaultValue: undefined,
  disabled: false,
  emptyStateText: 'No results found',
  id: 'multi-select-id',
  label: 'Permissible attributes',
  name: 'multi-select',
  onBlur: console.log, // eslint-disable-line no-console
  onChange: console.log, // eslint-disable-line no-console
  onFocus: console.log, // eslint-disable-line no-console
  onInputChange: console.log, // eslint-disable-line no-console
  options: defaultOptions,
  placeholder: 'Select...',
  required: false,
  hasError: false,
  hint: '',
  size: 'default',
};
