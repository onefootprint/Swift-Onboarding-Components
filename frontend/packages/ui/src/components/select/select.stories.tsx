import { ComponentMeta, Story } from '@storybook/react';
import React, { useState } from 'react';

import Box from '../box';
import Button from '../button';
import Typography from '../typography';
import defaultOptions from './__fixtures__';
import Select, { SelectProps } from './select';
import type { SelectOption } from './select.types';

export default {
  title: 'Components/Select',
  component: Select,
} as ComponentMeta<typeof Select>;

const Template: Story<SelectProps> = ({
  disabled,
  emptyStateTestID,
  emptyStateText,
  hasError,
  hintText,
  id,
  label,
  onSearchChangeText,
  onSelect,
  options = defaultOptions,
  placeholderText,
  searchPlaceholderText,
  testID,
}: SelectProps) => {
  const [selectedOption, setSelectedOption] = useState<
    SelectOption | null | undefined
  >(null);

  const handleSelect = (nextOption?: SelectOption | null) => {
    setSelectedOption(nextOption);
    onSelect(nextOption);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '500px',
        padding: 8,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="heading-2" color="primary">
            What is your residential address?
          </Typography>
        </Box>
        <Box sx={{ marginBottom: 8 }}>
          <Typography variant="body-2" color="secondary">
            We are legally required to collect this information.{' '}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ marginBottom: 8 }}>
        <Select
          disabled={disabled}
          emptyStateTestID={emptyStateTestID}
          emptyStateText={emptyStateText}
          hasError={hasError}
          hintText={hintText}
          id={id}
          label={label}
          onSearchChangeText={onSearchChangeText}
          onSelect={handleSelect}
          options={options}
          placeholderText={placeholderText}
          searchPlaceholderText={searchPlaceholderText}
          selectedOption={selectedOption}
          testID={testID}
        />
      </Box>
      <Box sx={{ marginBottom: 8 }}>
        <Button fullWidth>Continue</Button>
      </Box>
    </Box>
  );
};

export const Base = Template.bind({});
Base.args = {
  disabled: false,
  emptyStateTestID: 'empty-state-test-id',
  emptyStateText: 'No results :(',
  hasError: false,
  hintText: 'Hint',
  id: 'select-field',
  label: 'State',
  onSearchChangeText: console.log,
  onSelect: console.log,
  options: defaultOptions,
  placeholderText: 'Select...',
  searchPlaceholderText: 'Search',
  selectedOption: null,
  testID: 'select-test-id',
};

export const WithoutSearch = Template.bind({});
WithoutSearch.args = {
  disabled: false,
  emptyStateTestID: 'empty-state-test-id',
  emptyStateText: 'No results :(',
  hasError: false,
  hintText: 'Hint',
  id: 'select-field',
  label: 'Initial',
  onSearchChangeText: console.log,
  onSelect: console.log,
  options: [
    { value: 'Option 1', label: 'Option 1' },
    { value: 'Option 2', label: 'Option 2' },
    { value: 'Option 3', label: 'Option 3' },
    { value: 'Option 4', label: 'Option 4' },
    { value: 'Option 5', label: 'Option 5' },
    { value: 'Option 6', label: 'Option 6' },
  ],
  placeholderText: 'Select...',
  searchPlaceholderText: 'Search',
  selectedOption: null,
  testID: 'select-test-id',
};
