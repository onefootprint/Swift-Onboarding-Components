/* eslint-disable react/jsx-props-no-spreading */
import Downshift from 'downshift';
import unary from 'lodash/unary';
import React, { Fragment, useMemo, useState } from 'react';

import DefaultOption from '../internal/default-option';
import Hint from '../internal/hint';
import Label from '../internal/label';
import SelectSearch from './components/select-search';
import TriggerButton from './components/trigger-button';
import usePopper from './hooks/use-popper';
import MIN_NUMBER_OF_OPTIONS_TO_SHOW_SEARCH from './select.constants';
import S from './select.styles';
import type { SelectOption } from './select.types';
import filterValues from './select.utils';

export type SelectProps<Option extends SelectOption = SelectOption> = {
  disabled?: boolean;
  emptyStateTestID?: string;
  emptyStateText?: string;
  hasError?: boolean;
  hintText?: string;
  id?: string;
  label: string;
  onSearchChangeText?: (nextValue: string) => void;
  onSelect: (option?: Option | null) => void;
  options: Option[];
  placeholder?: string;
  renderOption?: (option: {
    disableHoverStyles: boolean;
    highlighted: boolean;
    label: Option['label'];
    onClick: React.MouseEventHandler<HTMLLIElement>;
    onMouseDown: React.MouseEventHandler<HTMLLIElement>;
    onMouseMove: React.MouseEventHandler<HTMLLIElement>;
    searchWords: string[];
    selected: boolean;
    value: Option['value'];
  }) => React.ReactNode;
  searchPlaceholder?: string;
  selectedOption?: Option | null;
  testID?: string;
};

const Select = <T extends SelectOption = SelectOption>({
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
  placeholder = 'Select',
  searchPlaceholder = 'Search',
  selectedOption,
  testID,
  renderOption = option => (
    <DefaultOption
      label={option.label}
      disableHoverStyles={option.disableHoverStyles}
      highlighted={option.highlighted}
      onClick={option.onClick}
      onMouseDown={option.onMouseDown}
      onMouseMove={option.onMouseMove}
      searchWords={option.searchWords}
      selected={option.selected}
    />
  ),
}: SelectProps<T>) => {
  // TODO: Migrate to useId once we migrate to react 18
  // https://github.com/onefootprint/frontend-monorepo/issues/61
  const id = baseID || `input-${label || placeholder}`;
  const { setReferenceElement, setPopperElement, popper } = usePopper();
  const [searchValue, setSearchValue] = useState('');
  const searchWords = useMemo(() => searchValue.split(' '), [searchValue]);
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
      // This is necessary because of the type getItemProps, which doesn't account for the
      // constraint we have defined on our generic type.
      // It won't produce any side effects, given the rest is protected
      selectedItem={selectedOption as any}
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
        const menuProps = getMenuProps({}, { suppressRefError: true });
        const inputProps = getInputProps();

        return (
          <S.Container {...getRootProps()} data-testid={testID}>
            <Label {...getLabelProps({ htmlFor: id })}>{label}</Label>
            <TriggerButton
              color={selectedOption ? 'primary' : 'tertiary'}
              disabled={disabled}
              getToggleButtonProps={getToggleButtonProps}
              hasError={hasError}
              id={id}
              isOpen={isOpen}
              ref={setReferenceElement}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </TriggerButton>
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
                    placeholder={searchPlaceholder}
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
                    const valueInString = option.value.toString();
                    return (
                      <Fragment key={valueInString}>
                        {renderOption({
                          value: option.value,
                          disableHoverStyles: highlightedIndex !== -1,
                          highlighted: highlightedIndex === index,
                          label: option.label,
                          onClick: optionProps.onClick,
                          onMouseDown: optionProps.onMouseDown,
                          onMouseMove: optionProps.onMouseMove,
                          searchWords,
                          selected: selectedOption?.value === option.value,
                        })}
                      </Fragment>
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
