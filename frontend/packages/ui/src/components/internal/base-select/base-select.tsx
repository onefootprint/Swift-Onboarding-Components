import React, { useCallback, useRef, useState } from 'react';
import ReactSelect, { defaultTheme, OptionProps } from 'react-select';
import styled, { css, useTheme } from 'styled-components';
import { useEventListener, useOnClickOutside } from 'usehooks-ts';

import Box from '../../box';
import Hint from '../hint';
import Label from '../label';
import type { BaseSelectOption } from './base-select.types';
import EmptyState from './components/empty-state';
import Input from './components/input';
import MenuList from './components/menu-list';
import Option from './components/option';

export type BaseSelectProps<Option extends BaseSelectOption> = {
  disabled?: boolean;
  emptyStateText?: string;
  hasError?: boolean;
  hint?: string;
  id?: string;
  label?: string;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: (newOption: Option) => void;
  options: Option[];
  searchPlaceholder?: string;
  isSearchable?: boolean;
  renderTrigger?: (options: {
    onClick: () => void;
    ref: React.RefObject<HTMLButtonElement>;
    selectedOption?: Option;
    isOpen: boolean;
  }) => React.ReactNode;
  value?: Option;
  OptionComponent?: React.ComponentType<OptionProps<any, false, any>>;
  testID?: string;
};

const BaseSelect = <Option extends BaseSelectOption>({
  disabled,
  emptyStateText = 'No results found',
  OptionComponent = Option,
  hasError,
  hint,
  id,
  label,
  name,
  onBlur,
  onChange,
  options,
  renderTrigger,
  searchPlaceholder = 'Search',
  isSearchable = true,
  testID,
  value,
}: BaseSelectProps<Option>) => {
  const [isOpen, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const { dropdown } = theme.components;

  const closeDropdown = () => {
    setOpen(false);
  };

  useEventListener('keydown', event => {
    if (event.key === 'Tab' || event.key === 'Escape') {
      closeDropdown();
    }
  });
  useOnClickOutside(containerRef, closeDropdown);

  const handleFakeSelectFocus = () => {
    triggerRef.current?.focus();
  };

  const handleToggleDropdown = () => {
    setOpen(currentOpen => !currentOpen);
  };

  const handleAutoComplete = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const autoCompletedValue = event.target.value;
    if (autoCompletedValue) {
      const possibleOption = options.find(
        option => option.label === autoCompletedValue,
      );
      if (possibleOption) {
        onChange?.(possibleOption);
      }
    }
  };

  const handleChange = (newOption: unknown) => {
    onChange?.(newOption as Option);
    closeDropdown();
  };

  const renderEmptyState = useCallback(
    () => <EmptyState>{emptyStateText}</EmptyState>,
    [emptyStateText],
  );

  return (
    <Box ref={containerRef} testID={testID}>
      {label && <Label htmlFor={id || label}>{label}</Label>}
      <HiddenSelect
        aria-hidden="true"
        autoComplete="country-name"
        id={id || label}
        onChange={handleAutoComplete}
        onFocus={handleFakeSelectFocus}
        ref={selectRef}
      />
      <Dropdown>
        {renderTrigger?.({
          isOpen,
          onClick: handleToggleDropdown,
          ref: triggerRef,
          selectedOption: value,
        })}
        {isOpen && (
          <DropdownMenu className="fp-dropdown">
            <ReactSelect
              isSearchable={isSearchable}
              maxMenuHeight={180}
              backspaceRemovesValue={false}
              controlShouldRenderValue={false}
              hideSelectedOptions={false}
              autoFocus
              components={{
                DropdownIndicator: null,
                IndicatorSeparator: null,
                Input,
                // @ts-ignore
                MenuList,
                Option: OptionComponent,
                Placeholder: () => null,
                SingleValue: () => null,
                ...(isSearchable ? {} : { Control: () => null }),
              }}
              inputId={id}
              isDisabled={disabled}
              menuIsOpen
              name={name}
              noOptionsMessage={renderEmptyState}
              onBlur={onBlur}
              onChange={handleChange}
              options={options}
              placeholder={searchPlaceholder}
              styles={{
                control: () => ({
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: `${dropdown.borderWidth} solid ${dropdown.borderColor}`,
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  outline: 0,
                  position: 'relative',
                  transition: 'all 100ms',
                  borderRadius: `${dropdown.borderRadius} ${dropdown.borderRadius} 0 0`,
                  background: dropdown.bg,
                  height: 40,
                  '&:hover': {
                    borderColor: dropdown.borderColor,
                  },
                }),
                menu: () => ({}),
              }}
              value={value}
              theme={{
                ...defaultTheme,
                colors: {
                  ...defaultTheme.colors,
                  primary: theme.color.accent,
                  primary25: theme.overlay['darken-1'],
                  primary50: theme.overlay['darken-2'],
                },
                borderRadius: 0,
                spacing: {
                  baseUnit: 4,
                  controlHeight: 40,
                  menuGutter: 8,
                },
              }}
            />
          </DropdownMenu>
        )}
      </Dropdown>
      {hint && <Hint hasError={hasError}>{hint}</Hint>}
    </Box>
  );
};

const Dropdown = styled.div`
  position: relative;
`;

const DropdownMenu = styled.div`
  ${({ theme }) => {
    const { dropdown } = theme.components;

    return css`
      background: ${dropdown.bg};
      border-radius: ${dropdown.borderRadius};
      border: ${dropdown.borderWidth} solid ${dropdown.borderColor};
      box-shadow: ${dropdown.elevation};
      margin-top: ${theme.spacing[3]};
      position: absolute;
      width: 100%;
      z-index: ${theme.zIndex.dropdown};
      overflow: hidden;
    `;
  }}
`;

const HiddenSelect = styled.input`
  background: none;
  border: 0px;
  display: block;
  height: 1px;
  margin: 0px;
  outline: 0px;
  padding: 0px;
  width: 1px;
`;

export default BaseSelect;
