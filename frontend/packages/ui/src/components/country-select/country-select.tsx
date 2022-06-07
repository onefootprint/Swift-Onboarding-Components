import { COUNTRIES as options } from 'global-constants';
import React from 'react';
import styled, { css } from 'styled-components';

import DefaultOption from '../internal/default-option';
import Flag from '../internal/flag';
import Select, { SelectProps } from '../select';
import type { CountrySelectOption } from './country-select.types';

export { options };

export type CountrySelectProps = Omit<
  SelectProps<CountrySelectOption>,
  'options' | 'renderOption'
>;

const CountrySelect = ({
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
  selectedOption,
  testID,
}: CountrySelectProps) => (
  <Select<CountrySelectOption>
    disabled={disabled}
    emptyStateTestID={emptyStateTestID}
    emptyStateText={emptyStateText}
    hasError={hasError}
    hintText={hintText}
    id={id}
    label={label}
    onSearchChangeText={onSearchChangeText}
    onSelect={onSelect}
    options={options}
    placeholder={placeholder}
    searchPlaceholder={searchPlaceholder}
    selectedOption={selectedOption}
    testID={testID}
    renderOption={option => (
      <DefaultOption
        disableHoverStyles={option.disableHoverStyles}
        highlighted={option.highlighted}
        label={option.label}
        onClick={option.onClick}
        onMouseDown={option.onMouseDown}
        onMouseMove={option.onMouseMove}
        prefixComponent={<StyledFlag code={option.value} />}
        searchWords={option.searchWords}
        selected={option.selected}
      />
    )}
  />
);

const StyledFlag = styled(Flag)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[3]}px;
  `}
`;

export default CountrySelect;
