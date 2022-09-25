import { STATES } from '@onefootprint/global-constants';
import { ComponentMeta, Story } from '@storybook/react';
import React, { useState } from 'react';

import Select, { SelectOption, SelectProps } from './select';

export default {
  title: 'Components/Select',
  component: Select,
} as ComponentMeta<typeof Select>;

const Template: Story<SelectProps> = ({
  disabled,
  hasError,
  hint,
  label,
  onChange,
  options = STATES,
  placeholder,
  value,
  searchPlaceholder,
  isSearchable,
}: SelectProps) => {
  const [selectedOption, setSelectedOption] = useState<
    SelectOption | undefined
  >(value);

  const handleSelect = (newOption: SelectOption) => {
    setSelectedOption(newOption);
    if (onChange) {
      onChange(newOption);
    }
  };

  return (
    <Select
      disabled={disabled}
      hasError={hasError}
      hint={hint}
      label={label}
      onChange={handleSelect}
      options={options}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      isSearchable={isSearchable}
      value={selectedOption}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  disabled: false,
  hasError: false,
  hint: '',
  label: 'State',
  onChange: console.log,
  options: STATES,
  placeholder: 'Select',
  searchPlaceholder: 'Search',
  isSearchable: true,
  value: undefined,
};
