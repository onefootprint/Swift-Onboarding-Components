/* eslint-disable react/jsx-props-no-spreading */
import { Property } from 'csstype';
import { useCombobox } from 'downshift';
import { usePlacesAutocomplete } from 'hooks';
import take from 'lodash/take';
import React, { forwardRef } from 'react';
import mergeRefs from 'react-merge-refs';
import styled, { css } from 'styled';

import BaseInput, { BaseInputProps } from '../internal/base-input';
import Label from '../internal/label';
import type { Item } from './adress-input.types';
import AddressDropdownFooter from './components/address-dropdown-footer';
import AddressDropdownItem from './components/address-dropdown-item';
import usePopper from './hooks/use-popper';

const MAX_OF_RESULTS = 5;

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
      suggestions: { data },
      setValue,
    } = usePlacesAutocomplete({
      requestOptions: {
        componentRestrictions: {
          country,
        },
      },
      debounce: 300,
    });
    const options = take(data, MAX_OF_RESULTS);
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
      items: options,
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
    const hasResults = options.length > 0;
    const hasTypedMinimumRequired = value.length > 1;
    const isDropdownOpen =
      downShiftIsOpen && hasTypedMinimumRequired && hasResults;

    return (
      <>
        {label ? <Label {...getLabelProps()}>{label}</Label> : null}
        <Container
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
            <Dropdown
              {...menuProps}
              ref={mergeRefs([menuProps.ref, setPopperElement])}
              {...popper.attributes.popper}
              style={popper.styles.popper}
            >
              <>
                {options.map((option, index) => {
                  const optionProps = getItemProps({ item: option, index });
                  return (
                    <AddressDropdownItem
                      ariaSelected={optionProps['aria-selected']}
                      disableHoverStyles={highlightedIndex !== -1}
                      highlighted={highlightedIndex === index}
                      id={optionProps.id}
                      key={option.place_id}
                      onClick={optionProps.onClick}
                      onMouseMove={optionProps.onMouseMove}
                      ref={optionProps.ref}
                      searchWords={value.split(' ')}
                      subtitle={option.structured_formatting.secondary_text}
                      title={option.structured_formatting.main_text}
                    />
                  );
                })}
                <AddressDropdownFooter />
              </>
            </Dropdown>
          ) : null}
        </Container>
      </>
    );
  },
);

const Container = styled.div`
  position: relative;
`;

const Dropdown = styled.ul<{
  maxHeight?: Property.MaxHeight;
}>`
  ${({ theme, maxHeight = 330 }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.primary};
    box-shadow: ${theme.elevation[2]};
    max-height: ${maxHeight};
    outline: none;
    padding: ${theme.spacing[3]}px 0 0;
    width: 100%;
  `}
`;

export default AddressInput;
