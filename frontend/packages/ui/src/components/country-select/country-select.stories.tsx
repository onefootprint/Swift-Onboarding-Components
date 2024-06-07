import type { ComponentMeta, Story } from '@storybook/react';
import React, { useState } from 'react';

import type { CountrySelectProps } from './country-select';
import CountrySelect from './country-select';
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
    hint: {
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
      description: 'Text to be displayed in the select when there are options selected',
      required: false,
      table: { defaultValue: { summary: 'Select' } },
    },
    value: {
      control: 'object',
      description: 'Selected option',
      required: false,
    },
    searchPlaceholder: {
      description: 'Placeholder text to be displayed on the search',
      required: false,
      table: { defaultValue: { summary: 'Search' } },
    },
    onChange: {
      description: 'Event called after selecting an option',
      required: true,
    },
  },
} as ComponentMeta<typeof CountrySelect>;

const Template: Story<CountrySelectProps> = ({
  disabled,
  emptyStateText,
  hasError,
  hint,
  id,
  label,
  onChange,
  placeholder,
  searchPlaceholder,
  testID,
  value,
  locale,
}: CountrySelectProps) => {
  const [selectedOption, setSelectedOption] = useState<CountrySelectOption | undefined>(value);

  const handleSelect = (nextOption: CountrySelectOption) => {
    setSelectedOption(nextOption);
    if (onChange) {
      onChange(nextOption);
    }
  };

  return (
    <CountrySelect
      disabled={disabled}
      emptyStateText={emptyStateText}
      hasError={hasError}
      hint={hint}
      id={id}
      label={label}
      onChange={handleSelect}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      testID={testID}
      value={selectedOption}
      locale={locale}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  disabled: false,
  emptyStateText: 'No results :(',
  hasError: false,
  hint: 'Hint',
  id: 'select-field',
  label: 'Country',
  onChange: console.log, // eslint-disable-line no-console
  placeholder: 'Select...',
  searchPlaceholder: 'Search',
  testID: 'select-test-id',
  locale: 'es-MX',
  value: undefined,
};
