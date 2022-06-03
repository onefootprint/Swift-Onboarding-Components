import { ComponentMeta, Story } from '@storybook/react';
import React, { useState } from 'react';

import CountrySelect, { CountrySelectProps } from './country-select';
import type { CountrySelectOption } from './country-select.types';

export default {
  title: 'Components/CountrySelect',
  component: CountrySelect,
  argTypes: {
    disabled: {
      control: 'boolean',
      required: false,
      description: 'Disable interactions',
    },
    testID: {
      control: 'text',
      required: false,
      description: 'Append an attribute data-testid for testing purposes',
    },
    emptyStateTestID: {
      control: 'text',
      required: false,
      description:
        'Append an attribute data-testid on the empty-state element for testing purposes',
    },
    emptyStateText: {
      control: 'text',
      description: 'Text to display when there are no results from the search',
      required: false,
      table: { defaultValue: { summary: 'No results found.' } },
    },
    hasError: {
      control: 'boolean',
      description: 'Attach an error state to the select and hint text',
      required: false,
      table: { defaultValue: { summary: 'false' } },
    },
    label: {
      control: 'text',
      description: 'Label to be displayed, above the select',
      required: true,
    },
    hintText: {
      control: 'text',
      description: 'Display an informative text below the input',
      required: false,
    },
    id: {
      control: 'text',
      description: 'Native HTML attribute, to be used alongside with the label',
      required: false,
    },
    placeholder: {
      control: 'text',
      description:
        'Text to be displayed in the select when there are options selected',
      required: false,
      table: { defaultValue: { summary: 'Select' } },
    },
    selectedOption: {
      control: 'object',
      description: 'Selected option',
      required: false,
    },
    searchPlaceholder: {
      description: 'Placeholder text to be displayed on the search',
      required: false,
      table: { defaultValue: { summary: 'Search' } },
    },
    onSearchChangeText: {
      description: 'Event when the search text changes',
      required: false,
    },
    onSelect: {
      description: 'Event called after selecting an option',
      required: true,
    },
  },
} as ComponentMeta<typeof CountrySelect>;

const Template: Story<CountrySelectProps> = ({
  disabled,
  emptyStateTestID,
  emptyStateText,
  hasError,
  hintText,
  id,
  label,
  onSearchChangeText,
  onSelect,
  placeholder,
  searchPlaceholder,
  testID,
}: CountrySelectProps) => {
  const [selectedOption, setSelectedOption] = useState<
    CountrySelectOption | null | undefined
  >(null);

  const handleSelect = (nextOption?: CountrySelectOption | null) => {
    setSelectedOption(nextOption);
    onSelect(nextOption);
  };

  return (
    <CountrySelect
      disabled={disabled}
      emptyStateTestID={emptyStateTestID}
      emptyStateText={emptyStateText}
      hasError={hasError}
      hintText={hintText}
      id={id}
      label={label}
      onSearchChangeText={onSearchChangeText}
      onSelect={handleSelect}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      selectedOption={selectedOption}
      testID={testID}
    />
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
  label: 'Country',
  onSearchChangeText: console.log,
  onSelect: console.log,
  placeholder: 'Select...',
  searchPlaceholder: 'Search',
  selectedOption: null,
  testID: 'select-test-id',
};
