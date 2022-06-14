import React, { forwardRef } from 'react';

import Input, { InputProps } from '../internal/input';
import ClearButton from './components/clear-button';
import SearchIcon from './components/search-icon';
import { sizeToHeight, sizeToInputPadding } from './search-input.constants';
import type { Size } from './search-input.types';

type BaseProps = Omit<
  InputProps,
  | 'disabled'
  | 'hasError'
  | 'hintText'
  | 'label'
  | 'mask'
  | 'placeholder'
  | 'type'
>;

export type SearchInputProps = BaseProps & {
  clearButtonAriaLabel?: string;
  inputSize?: Size;
  onReset?: () => void;
  placeholder?: string;
  suffixElement?: React.ReactNode;
};

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      clearButtonAriaLabel = 'Reset',
      inputSize = 'default',
      onChange,
      onChangeText,
      onReset,
      placeholder = 'Search...',
      suffixElement: SuffixElement,
      value,
      ...remainingProps
    }: SearchInputProps,
    ref,
  ) => {
    const handleClearInput = () => {
      onChangeText?.('');
      onReset?.();
    };

    const renderSuffix = () => {
      if (SuffixElement) {
        return SuffixElement;
      }
      if (value) {
        return (
          <ClearButton
            size={inputSize}
            onClick={handleClearInput}
            aria-label={clearButtonAriaLabel}
          />
        );
      }
      return undefined;
    };

    return (
      <Input
        {...remainingProps}
        placeholder={placeholder}
        fontVariant={inputSize === 'compact' ? 'body-4' : 'body-3'}
        onChange={onChange}
        onChangeText={onChangeText}
        prefixElement={<SearchIcon size={inputSize} />}
        ref={ref}
        suffixElement={renderSuffix()}
        sx={{
          paddingLeft: sizeToInputPadding[inputSize],
          height: sizeToHeight[inputSize],
        }}
        type="text"
        value={value}
      />
    );
  },
);

export default SearchInput;
