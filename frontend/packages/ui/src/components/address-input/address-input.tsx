/* eslint-disable react/jsx-props-no-spreading */
import { useCombobox } from 'downshift';
import usePlacesAutocomplete from 'hooks';
import React, { forwardRef } from 'react';
import mergeRefs from 'react-merge-refs';

import BaseInput, { BaseInputProps } from '../internal/base-input';
import Label from '../internal/label';
import S from './address-input.styles';
import type { Item } from './adress-input.types';
import AddressDropdownFooter from './components/address-dropdown-footer';
import AddressDropdownItem from './components/address-dropdown-item';
import usePopper from './hooks/use-popper';

export type AddressInputProps = Pick<
  BaseInputProps,
  | 'disabled'
  | 'hasError'
  | 'hintText'
  | 'label'
  | 'name'
  | 'onChangeText'
  | 'placeholder'
  | 'required'
  | 'tabIndex'
  | 'testID'
  | 'value'
> & {
  onSelect: (item?: Item | null) => void;
  country: string;
};

const AddressInput = forwardRef<HTMLInputElement, AddressInputProps>(
  (
    {
      country = 'US',
      disabled,
      hasError,
      hintText,
      label,
      name,
      onChangeText,
      onSelect,
      placeholder,
      required,
      tabIndex,
      testID,
      value = '',
    }: AddressInputProps,
    ref,
  ) => {
    const { setReferenceElement, setPopperElement, popper } = usePopper();
    const {
      suggestions: { data: items },
      setValue,
    } = usePlacesAutocomplete({
      requestOptions: {
        componentRestrictions: {
          country,
        },
      },
      debounce: 300,
    });
    const {
      getComboboxProps,
      getInputProps,
      getItemProps,
      getLabelProps,
      getMenuProps,
      getToggleButtonProps,
      highlightedIndex,
      isOpen: downShiftIsOpen,
    } = useCombobox({
      items,
      itemToString: item => (item ? item.structured_formatting.main_text : ''),
      inputValue: value,
      onSelectedItemChange: ({ selectedItem }) => {
        onChangeText?.(selectedItem?.structured_formatting.main_text || '');
        onSelect(selectedItem);
      },
      onInputValueChange: ({ inputValue }) => {
        const nextValue = inputValue || '';
        onChangeText?.(nextValue);
        setValue(nextValue);
      },
    });
    const comboBoxProps = getComboboxProps();
    const toggleButtonProps = getToggleButtonProps();
    const inputProps = getInputProps();
    const menuProps = getMenuProps({}, { suppressRefError: true });
    const hasResults = items.length > 0;
    const hasTypedMinimumRequired = value.length > 1;
    const isDropdownOpen =
      downShiftIsOpen && hasTypedMinimumRequired && hasResults;

    return (
      <>
        {label ? <Label {...getLabelProps()}>{label}</Label> : null}
        <S.Container
          aria-expanded={comboBoxProps['aria-expanded']}
          aria-haspopup={comboBoxProps['aria-haspopup']}
          aria-owns={comboBoxProps['aria-owns']}
          ref={comboBoxProps.ref}
          role={comboBoxProps.role}
        >
          <BaseInput
            aria-autocomplete={inputProps['aria-autocomplete']}
            aria-controls={inputProps['aria-controls']}
            aria-labelledby={inputProps['aria-labelledby']}
            autoComplete={inputProps.autoComplete}
            disabled={disabled}
            hasError={hasError}
            hintText={hintText}
            id={inputProps.id}
            name={name}
            onBlur={inputProps.onBlur}
            onChange={inputProps.onChange}
            onClick={toggleButtonProps.onClick}
            onKeyDown={inputProps.onKeyDown}
            placeholder={placeholder}
            ref={mergeRefs([ref, setReferenceElement, inputProps.ref])}
            required={required}
            tabIndex={tabIndex}
            testID={testID}
            value={value}
          />
          {isDropdownOpen ? (
            <S.Dropdown
              {...menuProps}
              ref={mergeRefs([menuProps.ref, setPopperElement])}
              {...popper.attributes.popper}
              style={popper.styles.popper}
            >
              <>
                {items.map((item, index) => {
                  const itemProps = getItemProps({ item, index });
                  return (
                    <AddressDropdownItem
                      ariaSelected={itemProps['aria-selected']}
                      disableHoverStyles={highlightedIndex !== -1}
                      highlighted={highlightedIndex === index}
                      id={itemProps.id}
                      key={item.place_id}
                      matchedText={item.matched_substrings}
                      onClick={itemProps.onClick}
                      onMouseMove={itemProps.onMouseMove}
                      ref={itemProps.ref}
                      subtitle={item.structured_formatting.secondary_text}
                      title={item.structured_formatting.main_text}
                    />
                  );
                })}
                <AddressDropdownFooter />
              </>
            </S.Dropdown>
          ) : null}
        </S.Container>
      </>
    );
  },
);

export default AddressInput;
