/* eslint-disable react/jsx-props-no-spreading */
import { useVirtualizer } from '@tanstack/react-virtual';
import { Properties } from 'csstype';
import Downshift from 'downshift';
import noop from 'lodash/noop';
import unary from 'lodash/unary';
import React, {
  Fragment,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import DefaultOption from '../internal/default-option';
import Hint from '../internal/hint';
import Label from '../internal/label';
import SelectSearch from './components/select-search';
import TriggerButton from './components/trigger-button';
import usePopper from './hooks/use-popper';
import MIN_NUMBER_OF_OPTIONS_TO_SHOW_SEARCH from './select.constants';
import S from './select.styles';
import type { SelectOption } from './select.types';
import { filterValues, getItem } from './select.utils';

export type SelectProps<Option extends SelectOption = SelectOption> = {
  disabled?: boolean;
  emptyStateTestID?: string;
  emptyStateText?: string;
  hasError?: boolean;
  hintText?: string;
  id?: string;
  label: string;
  onChange?: (option: Option | null) => void;
  onSearchChangeText?: (nextValue: string) => void;
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
    style?: Properties;
    value: Option['value'];
  }) => React.ReactNode;
  searchPlaceholder?: string;
  value?: string | number | null;
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
  onChange = noop,
  options,
  placeholder = 'Select',
  searchPlaceholder = 'Search',
  value = null,
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
      style={option.style}
    />
  ),
}: SelectProps<T>) => {
  const fallbackId = useId();
  const id = baseID || fallbackId;
  const parentRef = useRef<HTMLDivElement>(null);
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
  const selectedItem = useMemo(() => getItem(options, value), [options, value]);
  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 36, []),
    overscan: 6,
  });

  const handleSearchChangeText = (nextValue: string) => {
    setSearchValue(nextValue);
    onSearchChangeText?.(nextValue);
  };

  return (
    <Downshift
      selectedItem={selectedItem as any}
      itemToString={item => (item ? item.label : '')}
      onChange={unary(onChange)}
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
              color={selectedItem ? 'primary' : 'tertiary'}
              disabled={disabled}
              getToggleButtonProps={getToggleButtonProps}
              hasError={hasError}
              id={id}
              isOpen={isOpen}
              ref={setReferenceElement}
            >
              {selectedItem ? selectedItem.label : placeholder}
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
                {shouldShowEmptyState ? (
                  <S.EmptyState data-testid={emptyStateTestID}>
                    {emptyStateText}
                  </S.EmptyState>
                ) : (
                  <S.ListContainer ref={parentRef}>
                    <S.List
                      aria-labelledby={menuProps['aria-labelledby']}
                      id={menuProps.id}
                      ref={menuProps.ref}
                      role={menuProps.role}
                      style={{
                        height: rowVirtualizer.getTotalSize(),
                      }}
                    >
                      {rowVirtualizer.getVirtualItems().map(virtualItem => {
                        const option = filteredOptions[virtualItem.index];
                        const { index } = virtualItem;
                        const optionProps = getItemProps({
                          item: option,
                          index,
                        });
                        return (
                          <Fragment key={virtualItem.key}>
                            {renderOption({
                              disableHoverStyles: highlightedIndex !== -1,
                              highlighted: highlightedIndex === index,
                              label: option.label,
                              onClick: optionProps.onClick,
                              onMouseDown: optionProps.onMouseDown,
                              onMouseMove: optionProps.onMouseMove,
                              searchWords,
                              selected: value === option.value,
                              value: option.value,
                              style: {
                                height: `${virtualItem.size}px`,
                                transform: `translateY(${virtualItem.start}px)`,
                              },
                            })}
                          </Fragment>
                        );
                      })}
                    </S.List>
                  </S.ListContainer>
                )}
              </S.DropdownContainer>
            )}
          </S.Container>
        );
      }}
    </Downshift>
  );
};

export default Select;
