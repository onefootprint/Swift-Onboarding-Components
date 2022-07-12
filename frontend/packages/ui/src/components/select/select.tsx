import React from 'react';

import BaseSelect, { BaseSelectProps } from '../internal/base-select';
import BaseSelectTrigger from '../internal/base-select-trigger';

export type SelectOption<T extends StringOrNumber = string> = {
  label: string;
  value: T;
};

export type SelectProps<Option extends SelectOption = SelectOption> =
  BaseSelectProps<Option> & {
    placeholder?: string;
  };

type StringOrNumber = string | number;

const Select = <Option extends SelectOption = SelectOption>({
  disabled,
  emptyStateText,
  hasError,
  hintText,
  id,
  label,
  name,
  onBlur,
  onChange,
  OptionComponent,
  options,
  placeholder = 'Select',
  searchPlaceholder,
  isSearchable,
  testID,
  value,
  renderTrigger = ({ onClick, ref, isOpen, selectedOption }) => (
    <BaseSelectTrigger
      disabled={disabled}
      hasError={hasError}
      hasFocus={isOpen}
      onClick={onClick}
      ref={ref}
    >
      {selectedOption?.label || placeholder}
    </BaseSelectTrigger>
  ),
}: SelectProps<Option>) => (
  <BaseSelect
    disabled={disabled}
    emptyStateText={emptyStateText}
    hasError={hasError}
    hintText={hintText}
    id={id}
    label={label}
    name={name}
    onBlur={onBlur}
    onChange={onChange}
    OptionComponent={OptionComponent}
    options={options}
    renderTrigger={renderTrigger}
    searchPlaceholder={searchPlaceholder}
    isSearchable={isSearchable}
    testID={testID}
    value={value}
  />
);

export default Select;
