import type { CountryRecord } from '@onefootprint/global-constants';
import { COUNTRIES } from '@onefootprint/global-constants';
import type { ForwardedRef } from 'react';
import React, { forwardRef } from 'react';
import type { TextInputProps } from 'react-native';

import Box from '../box';
import type { SelectOption, SelectRef } from '../select';
import Select from '../select';
import Typography from '../typography';

export type CountrySelectOption = SelectOption<CountryRecord>;

export type CountrySelectProps = {
  disabled?: boolean;
  emptyStateText?: string;
  hasError?: boolean;
  hint?: string;
  label?: string;
  onBlur?: () => void;
  onChange?: (newValue: CountrySelectOption) => void;
  onFocus?: () => void;
  options?: CountryRecord[];
  placeholder?: string;
  searchInputProps?: TextInputProps;
  searchTitle?: string;
  value?: CountrySelectOption;
};

const CountrySelect = forwardRef(
  (
    {
      disabled,
      emptyStateText = 'No countries found',
      hasError,
      hint,
      label = 'Country',
      onBlur,
      onChange,
      onFocus,
      options = COUNTRIES,
      placeholder = 'Select country',
      searchInputProps,
      searchTitle,
      value,
    }: CountrySelectProps,
    ref: ForwardedRef<SelectRef>,
  ) => {
    return (
      <Select<CountryRecord>
        disabled={disabled}
        emptyStateText={emptyStateText}
        hasError={hasError}
        hint={hint}
        label={label}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        options={options}
        placeholder={placeholder}
        renderTrigger={(triggerPlaceholder, selectedOption) => {
          return selectedOption ? (
            <Box gap={4} flexDirection="row" center>
              <Typography variant="body-4" color={disabled ? 'quaternary' : 'primary'}>
                {selectedOption.label}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body-4">{triggerPlaceholder}</Typography>
          );
        }}
        ref={ref}
        searchInputProps={searchInputProps}
        searchTitle={searchTitle}
        value={value}
      />
    );
  },
);

export default CountrySelect;
