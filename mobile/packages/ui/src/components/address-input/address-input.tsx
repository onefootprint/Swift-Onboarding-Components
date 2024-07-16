import { DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import type { TextInputProps } from 'react-native';
import { useTimeout } from 'usehooks-ts';

import Box from '../box';
import Hint from '../hint';
import Label from '../label';
import TextInput from '../text-input';
import type { AddressPrediction } from './address-input.types';
import Picker from './components/picker';

export type AddressInputRef = {
  onFocus: () => void;
  onBlur: () => void;
};

export type AddressInputProps = {
  autoFocus?: boolean;
  country?: CountryCode;
  disabled?: boolean;
  emptyStateResetText?: string;
  emptyStateText?: string;
  hasError?: boolean;
  hint?: string;
  label?: string;
  onBlur?: () => void;
  onChange?: (prediction?: AddressPrediction | null) => void;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  searchInputProps?: TextInputProps;
  searchTitle?: string;
  value?: string;
};

const AddressInput = forwardRef<AddressInputRef, AddressInputProps>(
  (
    {
      autoFocus,
      country = DEFAULT_COUNTRY.value,
      disabled = false,
      emptyStateResetText = 'Reset search',
      emptyStateText = 'No results found',
      hasError = false,
      hint,
      label,
      onBlur,
      onChange,
      onChangeText,
      onFocus,
      placeholder,
      searchInputProps,
      searchTitle = 'Search...',
      value,
    },
    ref,
  ) => {
    const [isFocused, setFocus] = useState(false);

    useTimeout(() => {
      if (autoFocus) {
        handleFocus();
      }
    }, 400);

    useImperativeHandle(
      ref,
      () => ({
        onFocus: handleFocus,
        onBlur: handleBlur,
      }),

      [],
    );

    const handleLabelPress = () => {
      handleFocus();
    };

    const handleFocus = () => {
      setFocus(true);
      onFocus?.();
    };

    const handleBlur = () => {
      setFocus(false);
      onBlur?.();
    };

    return (
      <Box>
        {label && (
          <Label onPress={handleLabelPress} marginBottom={3}>
            {label}
          </Label>
        )}
        <TextInput
          disabled={disabled}
          editable={false}
          onPressIn={disabled ? undefined : handleFocus}
          placeholder={placeholder}
          value={value}
        />
        <Box position="relative" />
        {!!hint && (
          <Hint marginTop={3} hasError={hasError}>
            {hint}
          </Hint>
        )}
        <Picker
          country={country}
          emptyStateResetText={emptyStateResetText}
          emptyStateText={emptyStateText}
          onChange={onChange}
          onChangeText={onChangeText}
          onClose={handleBlur}
          open={isFocused}
          searchInputProps={searchInputProps}
          title={searchTitle}
        />
      </Box>
    );
  },
);

export default AddressInput;
