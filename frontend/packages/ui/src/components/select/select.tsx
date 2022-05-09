/* eslint-disable react/jsx-props-no-spreading */
import Downshift from 'downshift';
import IcoCheck16 from 'icons/ico/ico-check-16';
import IcoChevronDown16 from 'icons/ico/ico-chevron-down-16';
import unary from 'lodash/unary';
import React, { useMemo, useState } from 'react';
import Highlighter from 'react-highlight-words';
import mergeRefs from 'react-merge-refs';
import { useTheme } from 'styled';

import Hint from '../internal/hint';
import Label from '../internal/label';
import SelectSearch from './components/select-search';
import usePopper from './hooks/use-popper';
import S from './select.styles';
import type { SelectOption } from './select.types';
import filterValues from './select.utils';

const MIN_NUMBER_OF_OPTIONS_TO_SHOW_SEARCH = 10;

export type SelectProps = {
  disabled?: boolean;
  emptyStateTestID?: string;
  emptyStateText?: string;
  hasError?: boolean;
  hintText?: string;
  id?: string;
  label: string;
  onSearchChangeText?: (nextValue: string) => void;
  onSelect: (option?: SelectOption | null) => void;
  options: SelectOption[];
  placeholderText?: string;
  searchPlaceholderText?: string;
  selectedOption?: SelectOption | null;
  testID?: string;
};

const Select = ({
  disabled = false,
  emptyStateTestID,
  emptyStateText = 'No results found.',
  hasError = false,
  hintText,
  id: baseID,
  label,
  onSearchChangeText,
  onSelect,
  options,
  placeholderText = 'Select',
  searchPlaceholderText = 'Search',
  selectedOption,
  testID,
}: SelectProps) => {
  const theme = useTheme();
  // TODO: Migrate to useId once we migrate to react 18
  // https://github.com/onefootprint/frontend-monorepo/issues/61
  const id = baseID || `input-${label || placeholderText}`;
  const { setReferenceElement, setPopperElement, popper } = usePopper();
  const [searchValue, setSearchValue] = useState('');
  const searchValueAsArray = useMemo(
    () => searchValue.split(' '),
    [searchValue],
  );
  const filteredOptions = useMemo(
    () => filterValues(options, searchValue),
    [searchValue, options],
  );
  const shouldShowEmptyState = filteredOptions.length === 0;
  const shouldShowTheSearch =
    options.length >= MIN_NUMBER_OF_OPTIONS_TO_SHOW_SEARCH;

  const handleSearchChangeText = (nextValue: string) => {
    setSearchValue(nextValue);
    onSearchChangeText?.(nextValue);
  };

  return (
    <Downshift
      selectedItem={selectedOption}
      itemToString={item => (item ? item.label : '')}
      onSelect={unary(onSelect)}
      inputValue={searchValue}
    >
      {({
        getLabelProps,
        getInputProps,
        getItemProps,
        getMenuProps,
        getRootProps,
        getToggleButtonProps,
        highlightedIndex,
        isOpen,
      }) => {
        const togglerProps = getToggleButtonProps({ disabled });
        const menuProps = getMenuProps({}, { suppressRefError: true });
        const inputProps = getInputProps();

        return (
          <S.Container {...getRootProps()} data-testid={testID}>
            <Label {...getLabelProps({ htmlFor: id })}>{label}</Label>
            <S.Button
              {...togglerProps}
              color={selectedOption ? 'primary' : 'tertiary'}
              hasError={hasError}
              id={id}
              isActive={isOpen}
              ref={mergeRefs([setReferenceElement, togglerProps.ref])}
            >
              {selectedOption ? selectedOption.label : placeholderText}
              <IcoChevronDown16 />
            </S.Button>
            {hintText && (
              <Hint color={hasError ? 'error' : 'tertiary'}>{hintText}</Hint>
            )}
            {isOpen && (
              <S.DropdownContainer
                {...popper.attributes.popper}
                ref={setPopperElement}
                style={popper.styles.popper}
                withPaddingTop={!shouldShowTheSearch}
              >
                {shouldShowTheSearch && (
                  <SelectSearch
                    aria-activedescendant={inputProps['aria-activedescendant']}
                    aria-autocomplete={inputProps['aria-autocomplete']}
                    aria-controls={inputProps['aria-controls']}
                    aria-labelledby={inputProps['aria-labelledby']}
                    autoComplete={inputProps.autoComplete}
                    id={inputProps.id}
                    onChangeText={handleSearchChangeText}
                    placeholder={searchPlaceholderText}
                    value={searchValue}
                  />
                )}
                {shouldShowEmptyState && (
                  <S.EmptyState data-testid={emptyStateTestID}>
                    {emptyStateText}
                  </S.EmptyState>
                )}
                <S.Dropdown
                  aria-labelledby={menuProps['aria-labelledby']}
                  id={menuProps.id}
                  ref={menuProps.ref}
                  role={menuProps.role}
                >
                  {filteredOptions.map((option, index) => {
                    const optionProps = getItemProps({ item: option, index });
                    return (
                      <S.DefaultOption
                        aria-selected={optionProps['aria-selected']}
                        disableHoverStyles={highlightedIndex !== -1}
                        highlighted={highlightedIndex === index}
                        id={optionProps.id}
                        key={option.value.toString()}
                        onClick={optionProps.onClick}
                        onMouseDown={optionProps.onMouseDown}
                        onMouseMove={optionProps.onMouseMove}
                        role={optionProps.role}
                      >
                        <Highlighter
                          searchWords={searchValueAsArray}
                          textToHighlight={option.label}
                          highlightStyle={{
                            background: 'none',
                            color: theme.colors.primary,
                            fontWeight:
                              theme.typographies['label-3'].fontWeight,
                          }}
                        >
                          {option.label}
                        </Highlighter>
                        {selectedOption?.value === option.value && (
                          <IcoCheck16 color="primary" />
                        )}
                      </S.DefaultOption>
                    );
                  })}
                </S.Dropdown>
              </S.DropdownContainer>
            )}
          </S.Container>
        );
      }}
    </Downshift>
  );
};

export default Select;
