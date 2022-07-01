import React, { useCallback, useRef, useState } from 'react';
import ReactSelect, { defaultTheme, OptionProps } from 'react-select';
import { useClickAway, useKey } from 'react-use';
import styled, { css, useTheme } from 'styled-components';

import Box from '../../box';
import Hint from '../hint';
import Label from '../label';
import type { BaseSelectOption } from './base-select.types';
import EmptyState from './components/empty-state';
import Input from './components/input';
import MenuList from './components/menu-list';
import Option from './components/option';
import useStyles from './hooks/use-styles';

export type BaseSelectProps<Option extends BaseSelectOption> = {
  disabled?: boolean;
  emptyStateText?: string;
  hasError?: boolean;
  hintText?: string;
  id?: string;
  label?: string;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: (newOption: Option) => void;
  options: Option[];
  searchPlaceholder?: string;
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
  hintText,
  id,
  label,
  name,
  onBlur,
  onChange,
  options,
  renderTrigger,
  searchPlaceholder = 'Search',
  testID,
  value,
}: BaseSelectProps<Option>) => {
  const [isOpen, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const styles = useStyles();

  const closeDropdown = () => {
    setOpen(false);
  };

  useKey('Tab', closeDropdown);
  useKey('Escape', closeDropdown);
  useClickAway(containerRef, closeDropdown);

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
          <DropdownMenu>
            <ReactSelect
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
              styles={styles}
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
                  baseUnit: theme.spacing[2],
                  controlHeight: 40,
                  menuGutter: theme.spacing[3],
                },
              }}
            />
          </DropdownMenu>
        )}
      </Dropdown>
      {hintText && (
        <Hint color={hasError ? 'error' : 'tertiary'}>{hintText}</Hint>
      )}
    </Box>
  );
};

const Dropdown = styled.div`
  position: relative;
`;

const DropdownMenu = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius[2]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.primary};
    box-shadow: ${theme.elevation[2]};
    margin-top: ${theme.spacing[3]}px;
    position: absolute;
    width: 100%;
    z-index: ${theme.zIndex.dropdown};
  `}
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
