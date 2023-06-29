import styled, { useTheme } from '@onefootprint/styled';
import React, { useCallback, useId, useState } from 'react';
import { usePopper } from 'react-popper';
import ReactSelect, { OptionProps } from 'react-select';

import Label, { LabelTooltipProps } from '../../label';
import Hint from '../hint';
import type { BaseSelectOption } from './base-select.types';
import modifiers from './base-select.utils';
import Control from './components/control';
import EmptyState from './components/empty-state';
import MenuList from './components/menu-list';
import Option from './components/option';

export type BaseSelectProps<Option extends BaseSelectOption> = {
  disabled?: boolean;
  emptyStateText?: string;
  hasError?: boolean;
  hint?: string;
  id?: string;
  label?: string;
  labelTooltip?: LabelTooltipProps;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: (newOption: Option) => void;
  options: Option[];
  searchPlaceholder?: string;
  renderTrigger?: (options: {
    isOpen: boolean;
    onClick: () => void;
    selectedOption?: Option;
    testID?: string;
  }) => React.ReactNode;
  value?: Option;
  OptionComponent?: React.ComponentType<OptionProps<any, false, any>>;
  testID?: string;
};

const BaseSelect = <Option extends BaseSelectOption>({
  disabled,
  emptyStateText = 'No results found',
  hasError,
  hint,
  id: baseId,
  label,
  labelTooltip,
  name,
  onBlur,
  onChange,
  OptionComponent = Option,
  options,
  renderTrigger,
  searchPlaceholder = 'Search',
  testID,
  value,
}: BaseSelectProps<Option>) => {
  const internalId = useId();
  const id = baseId || internalId;
  const [isOpen, setOpen] = useState(false);
  const theme = useTheme();
  const { dropdown, input } = theme.components;
  const [referenceElement, setReferenceElement] =
    useState<HTMLElement | null>();
  const [popperElement, setPopperElement] = useState<HTMLElement | null>();
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    strategy: 'fixed',
    modifiers,
  });
  const isSearchable = options.length > 7;

  const closeDropdown = () => {
    setOpen(false);
  };

  const toggleDropdown = () => {
    setOpen(currentOpen => !currentOpen);
  };

  const handleChange = (newOption: Option) => {
    onChange?.(newOption);
    closeDropdown();
  };

  const renderEmptyState = useCallback(
    () => <EmptyState>{emptyStateText}</EmptyState>,
    [emptyStateText],
  );

  return (
    <Container data-testid={testID} className="fp-dropdown">
      {label && (
        <Label tooltip={labelTooltip} htmlFor={id}>
          {label}
        </Label>
      )}
      <div ref={setReferenceElement}>
        {renderTrigger?.({
          testID: internalId,
          isOpen,
          onClick: toggleDropdown,
          selectedOption: value,
        })}
      </div>
      {isOpen && (
        <div
          data-private
          data-testid={`select-${internalId}`}
          ref={setPopperElement}
          style={{ ...styles.popper, zIndex: theme.zIndex.dropdown }}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...attributes.popper}
        >
          <ReactSelect
            id={id}
            autoFocus
            backspaceRemovesValue={false}
            controlShouldRenderValue={false}
            components={{
              Control,
              DropdownIndicator: null,
              IndicatorSeparator: null,
              MenuList,
              Option: OptionComponent,
              ...(isSearchable ? {} : { Control: () => null }),
            }}
            styles={{
              container: () => ({
                background: dropdown.bg,
                borderColor: dropdown.borderColor,
                borderRadius: dropdown.borderRadius,
                borderStyle: 'solid',
                borderWidth: dropdown.borderWidth,
                boxShadow: dropdown.elevation,
                marginTop: theme.spacing[3],
                overflow: 'hidden',
                width: '100%',
              }),
              placeholder: provided => ({
                ...provided,
                font: theme.typography['body-3'],
              }),
              control: () => ({
                alignItems: 'center',
                background: input.state.default.initial.bg,
                backgroundColor: dropdown.bg,
                borderRadiusTopLeftRadius: dropdown.borderRadius,
                borderRadiusTopRightRadius: dropdown.borderRadius,
                display: 'flex',
                height: 40,
              }),
              input: provided => ({
                ...provided,
                font: theme.typography['body-3'],
              }),
              menu: () => ({}),
            }}
            hideSelectedOptions={false}
            isDisabled={disabled}
            isSearchable={isSearchable}
            maxMenuHeight={180}
            menuIsOpen
            name={name}
            noOptionsMessage={renderEmptyState}
            onBlur={onBlur}
            onChange={handleChange}
            onMenuClose={closeDropdown}
            options={options}
            placeholder={searchPlaceholder}
            value={value}
          />
        </div>
      )}

      {hint && <Hint hasError={hasError}>{hint}</Hint>}
    </Container>
  );
};

const Container = styled.div``;

export default BaseSelect;
