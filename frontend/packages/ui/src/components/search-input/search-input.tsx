import React, { forwardRef } from 'react';

import Input, { InputProps } from '../internal/input';
import ClearButton from './components/clear-button';
import SearchIcon from './components/search-icon';

type BaseProps = Omit<
  InputProps,
  | 'disabled'
  | 'hasError'
  | 'hint'
  | 'label'
  | 'mask'
  | 'placeholder'
  | 'type'
  | 'size'
  | 'prefixComponent'
  | 'suffixComponent'
>;

export type SearchInputProps = BaseProps & {
  clearButtonAriaLabel?: string;
  onReset?: () => void;
  placeholder?: string;
};

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      clearButtonAriaLabel = 'Reset',
      onChange,
      onChangeText,
      onReset,
      placeholder = 'Search...',
      sx,
      value,
      ...remainingProps
    }: SearchInputProps,
    ref,
  ) => {
    const handleClearInput = () => {
      onChangeText?.('');
      onReset?.();
    };

    const renderSuffix = () =>
      value ? (
        <ClearButton
          aria-label={clearButtonAriaLabel}
          onClick={handleClearInput}
        />
      ) : null;

    return (
      <Input
        {...remainingProps}
        onChange={onChange}
        onChangeText={onChangeText}
        placeholder={placeholder}
        prefixComponent={<SearchIcon />}
        sx={{
          paddingLeft: 8,
          ...sx,
        }}
        ref={ref}
        size="compact"
        suffixComponent={renderSuffix()}
        value={value}
      />
    );
  },
);

export default SearchInput;
