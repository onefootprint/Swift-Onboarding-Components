import React from 'react';

import type { BaseSelectProps } from '../internal/base-select';
import BaseSelect from '../internal/base-select';
import BaseSelectTrigger from '../internal/base-select-trigger';

export type SelectOption<T extends StringOrNumber = string> = {
  label: string;
  value: T;
};

export type SelectProps<Option extends SelectOption = SelectOption> =
  BaseSelectProps<Option> & {
    placeholder?: string;
    isPrivate?: boolean;
  };

type StringOrNumber = string | number;

const Select = <Option extends SelectOption = SelectOption>({
  disabled,
  emptyStateText,
  hasError,
  hint,
  id,
  label,
  labelTooltip,
  name,
  onBlur,
  onChange,
  OptionComponent,
  options,
  placeholder = 'Select',
  searchPlaceholder,
  testID,
  value,
  isPrivate,
  renderTrigger = ({
    onClick,
    isOpen,
    selectedOption,
    testID: triggerTestID,
  }) => (
    <BaseSelectTrigger
      disabled={disabled}
      hasError={hasError}
      hasFocus={isOpen}
      onClick={onClick}
      testID={triggerTestID}
      isPrivate={isPrivate}
    >
      {selectedOption?.label || placeholder}
    </BaseSelectTrigger>
  ),
}: SelectProps<Option>) => (
  <BaseSelect
    disabled={disabled}
    emptyStateText={emptyStateText}
    hasError={hasError}
    hint={hint}
    id={id}
    label={label}
    labelTooltip={labelTooltip}
    name={name}
    onBlur={onBlur}
    onChange={onChange}
    OptionComponent={OptionComponent}
    options={options}
    renderTrigger={renderTrigger}
    searchPlaceholder={searchPlaceholder}
    testID={testID}
    value={value}
  />
);

export default Select;
