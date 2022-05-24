/* eslint-disable react/jsx-props-no-spreading */
import { useCombobox } from 'downshift';
import { usePlacesAutocomplete } from 'hooks';
import noop from 'lodash/noop';
import take from 'lodash/take';
import React, { forwardRef, useRef } from 'react';
import mergeRefs from 'react-merge-refs';
import styled, { css } from 'styled';

import BaseInput, { BaseInputProps } from '../internal/base-input';
import type { Item } from './adress-input.types';
import AddressDropdownFooter from './components/address-dropdown-footer';
import AddressDropdownItem from './components/address-dropdown-item';
import usePopper from './hooks/use-popper';

const MAX_OF_RESULTS = 5;

export type AddressInputProps = BaseInputProps & {
  onSelect?: (item?: Item | null) => void;
  country?: string;
};

const AddressInput = forwardRef<HTMLInputElement, AddressInputProps>(
  (
    {
      country = 'US',
      onBlur = noop,
      onChange = noop,
      onChangeText,
      onKeyDown = noop,
      onSelect = noop,
      ...rest
    }: AddressInputProps,
    ref,
  ) => {
    const isUncontrolled = rest.value === undefined;
    const localInputRef = useRef<HTMLInputElement>(null);
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
      getMenuProps,
      getToggleButtonProps,
      highlightedIndex,
      inputValue: value,
      isOpen: downShiftIsOpen,
    } = useCombobox({
      items: options,
      itemToString: item => (item ? item.structured_formatting.main_text : ''),
      onSelectedItemChange: ({ selectedItem }) => {
        onChangeText?.(selectedItem?.structured_formatting.main_text || '');
        onSelect(selectedItem);
        const hasToTriggerChangeEvent = isUncontrolled && localInputRef.current;
        if (hasToTriggerChangeEvent) {
          const event = new window.Event('change', { bubbles: true });
          localInputRef.current.dispatchEvent(event);
        }
      },
      onInputValueChange: ({ inputValue = '' }) => {
        const nextValue = inputValue;
        onChangeText?.(nextValue);
        setValue(nextValue);
      },
    });
    const comboBoxProps = getComboboxProps();
    const toggleButtonProps = getToggleButtonProps();
    const inputProps = getInputProps();
    const menuProps = getMenuProps({}, { suppressRefError: true });
    const hasResults = options.length > 0;
    const isDropdownOpen = downShiftIsOpen && hasResults;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      inputProps.onChange(event);
      onChange(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      inputProps.onBlur(event);
      onBlur(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      inputProps.onKeyDown(event);
      onKeyDown(event);
    };

    const renderAddressItem = (item: Item, index: number) => {
      const itemProps = getItemProps({ item, index });
      return (
        <AddressDropdownItem
          disableHoverStyles={highlightedIndex !== -1}
          highlighted={highlightedIndex === index}
          key={item.place_id}
          searchWords={value.split(' ')}
          subtitle={item.structured_formatting.secondary_text}
          title={item.structured_formatting.main_text}
          {...itemProps}
        />
      );
    };

    return (
      <Container {...comboBoxProps}>
        <BaseInput
          {...rest}
          {...toggleButtonProps}
          {...inputProps}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={mergeRefs([
            localInputRef,
            ref,
            setReferenceElement,
            inputProps.ref,
            toggleButtonProps.ref,
          ])}
        />
        {isDropdownOpen ? (
          <Dropdown
            {...menuProps}
            {...popper.attributes.popper}
            ref={mergeRefs([menuProps.ref, setPopperElement])}
            style={popper.styles.popper}
          >
            <>
              {options.map(renderAddressItem)}
              <AddressDropdownFooter />
            </>
          </Dropdown>
        ) : null}
      </Container>
    );
  },
);

const Container = styled.div`
  position: relative;
`;

const Dropdown = styled.ul`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[1]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.primary};
    box-shadow: ${theme.elevation[2]};
    max-height: 330px;
    outline: none;
    padding: ${theme.spacing[3]}px 0 0;
    width: 100%;
    z-index: ${theme.zIndex.dropdown};
  `}
`;

export default AddressInput;
