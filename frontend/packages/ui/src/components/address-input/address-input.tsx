'use client';

/* eslint-disable react/jsx-props-no-spreading */
import { DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';
import { useCombobox } from 'downshift';
import noop from 'lodash/noop';
import take from 'lodash/take';
import React, { forwardRef, useEffect, useRef } from 'react';
import mergeRefs from 'react-merge-refs';
import styled, { css } from 'styled-components';
import usePlacesAutocomplete from 'use-places-autocomplete';

import Box from '../box';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';
import type { AddressPrediction } from './address-input.types';
import AddressDropdownFooter from './components/address-dropdown-footer';
import AddressDropdownItem from './components/address-dropdown-item';
import usePopper from './hooks/use-popper';

const MAX_OF_RESULTS = 5;

export type AddressInputProps = Omit<InputProps, 'onSelect'> & {
  onSelect?: (prediction?: AddressPrediction | null) => void;
  country?: CountryCode;
};

const AddressInput = forwardRef<HTMLInputElement, AddressInputProps>(
  (
    {
      country = DEFAULT_COUNTRY.value,
      onBlur = noop,
      onChange = noop,
      onChangeText,
      onKeyDown = noop,
      onSelect = noop,
      value,
      ...props
    }: AddressInputProps,
    ref,
  ) => {
    const isUncontrolled = value === undefined;
    const localRef = useRef<HTMLInputElement>(null);
    const { setReferenceElement, setPopperElement, popper } = usePopper();
    const {
      suggestions: { data },
      setValue,
      clearCache,
      clearSuggestions,
    } = usePlacesAutocomplete({
      requestOptions: {
        componentRestrictions: {
          country,
        },
      },
    });

    useEffect(() => {
      clearCache();
      clearSuggestions();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [country]);

    const options = take(data, MAX_OF_RESULTS);
    const {
      getComboboxProps,
      getInputProps,
      getItemProps,
      getMenuProps,
      getToggleButtonProps,
      highlightedIndex,
      isOpen: downShiftIsOpen,
    } = useCombobox({
      items: options,
      itemToString: item => (item ? item.structured_formatting.main_text : ''),
      onSelectedItemChange: ({ selectedItem }) => {
        onChangeText?.(selectedItem?.structured_formatting.main_text || '');
        onSelect(selectedItem);

        const hasToTriggerChangeEvent = isUncontrolled && localRef.current;
        if (hasToTriggerChangeEvent) {
          const event = new window.Event('change', { bubbles: true });
          localRef.current.dispatchEvent(event);
        }
      },
      onInputValueChange: ({ inputValue: nextInputValue = '' }) => {
        onChangeText?.(nextInputValue);
        setValue(nextInputValue);
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

    const renderAddressItem = (item: AddressPrediction, index: number) => {
      const itemProps = getItemProps({ item, index });
      return (
        <AddressDropdownItem
          data-dd-privacy="mask"
          disableHoverStyles={highlightedIndex !== -1}
          highlighted={highlightedIndex === index}
          key={item.place_id}
          subtitle={item.structured_formatting.secondary_text}
          title={item.structured_formatting.main_text}
          {...itemProps}
        />
      );
    };

    return (
      <Box {...comboBoxProps}>
        <Box ref={setReferenceElement} position="relative">
          <Input
            {...props}
            {...toggleButtonProps}
            aria-autocomplete={inputProps['aria-autocomplete']}
            aria-controls={inputProps['aria-controls']}
            autoComplete="address-line1"
            id={inputProps.id}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            value={value}
            data-dd-privacy="mask"
            ref={mergeRefs([localRef, inputProps.ref, toggleButtonProps.ref, ref])}
          />
          {isDropdownOpen ? (
            <Dropdown
              {...menuProps}
              {...popper.attributes.popper}
              ref={mergeRefs([menuProps.ref, setPopperElement])}
              style={popper.styles.popper}
              data-dd-privacy="mask"
            >
              <>
                {options.map(renderAddressItem)}
                <AddressDropdownFooter />
              </>
            </Dropdown>
          ) : null}
        </Box>
      </Box>
    );
  },
);

const Dropdown = styled.ul`
  ${({ theme }) => {
    const { dropdown } = theme.components;
    return css`
      background: ${dropdown.bg};
      border-radius: ${dropdown.borderRadius};
      border: ${dropdown.borderWidth} solid ${dropdown.borderColor};
      box-shadow: ${dropdown.elevation};
      max-height: 332px;
      outline: none;
      padding: ${theme.spacing[3]} 0 0;
      width: 100%;
      z-index: ${theme.zIndex.dropdown};
    `;
  }}
`;

export default AddressInput;
