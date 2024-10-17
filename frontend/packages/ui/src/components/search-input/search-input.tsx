import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { InputProps } from '../internal/input';
import Input from '../internal/input';
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
  size?: 'compact' | 'default';
};

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      clearButtonAriaLabel,
      onChange,
      onChangeText,
      onReset,
      placeholder,
      sx,
      value,
      size = 'default',
      ...remainingProps
    }: SearchInputProps,
    ref,
  ) => {
    const { t } = useTranslation('ui');
    const handleClearInput = () => {
      onChangeText?.('');
      onReset?.();
    };

    const renderSuffix = () =>
      value ? (
        <ClearButton
          aria-label={clearButtonAriaLabel ?? (t('components.search-input.clear-button-aria-label-default') as string)}
          onClick={handleClearInput}
        />
      ) : null;

    return (
      <Input
        {...remainingProps}
        onChange={onChange}
        onChangeText={onChangeText}
        placeholder={placeholder ?? (t('components.search-input.placeholder-default') as string)}
        prefixComponent={<SearchIcon />}
        sx={{
          paddingLeft: 8,
          ...sx,
        }}
        ref={ref}
        size={size}
        suffixComponent={renderSuffix()}
        value={value}
      />
    );
  },
);

export default SearchInput;
