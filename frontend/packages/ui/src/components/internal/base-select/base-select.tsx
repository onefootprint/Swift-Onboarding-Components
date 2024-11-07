'use client';

import type React from 'react';
import { useCallback, useEffect, useId, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { usePopper } from 'react-popper';
import type { ControlProps, GroupBase, MenuListProps, OptionProps } from 'react-select';
import ReactSelect from 'react-select';
import styled, { useTheme } from 'styled-components';

import { createText } from '../../../utils/mixins';
import Hint from '../../hint';
import type { LabelTooltipProps } from '../../label';
import Label from '../../label';
import type { BaseSelectOption } from './base-select.types';
import modifiers from './base-select.utils';
import Control from './components/control';
import EmptyState from './components/empty-state';
import MenuList from './components/menu-list';
import Option from './components/option';
import Picker from './components/picker';
import type { ItemProps } from './components/picker/components/item';

export type BaseSelectSize = 'compact' | 'default';
const TOP_OFFSET = 40;

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
  renderTrigger?: (options: {
    isOpen: boolean;
    onClick: () => void;
    selectedOption?: Option;
    size?: BaseSelectSize;
    testID?: string;
    hasIcon?: boolean;
  }) => React.ReactNode;
  searchPlaceholder?: string;
  size?: BaseSelectSize;
  value?: Option;
  OptionComponent?: React.ComponentType<OptionProps<Option, false, GroupBase<Option>>>;
  testID?: string;
  MobileOptionComponent?: React.ComponentType<ItemProps>;
};

const BaseSelect = <Option extends BaseSelectOption>({
  disabled,
  emptyStateText,
  hasError,
  hint,
  id: baseId,
  label,
  labelTooltip,
  name,
  onBlur,
  onChange,
  OptionComponent = Option,
  options = [],
  renderTrigger,
  searchPlaceholder,
  size = 'default',
  testID,
  value,
  MobileOptionComponent,
}: BaseSelectProps<Option>) => {
  const { t } = useTranslation('ui');
  const internalId = useId();
  const id = baseId || internalId;
  const [isOpen, setOpen] = useState(false);
  const theme = useTheme();
  const { dropdown, input } = theme.components;
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>();
  const [popperElement, setPopperElement] = useState<HTMLElement | null>();
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    strategy: 'fixed',
    modifiers,
  });
  const isSearchable = options.length > 10;
  const [updatedValue, setUpdatedValue] = useState<Option | undefined>(value);
  const [mobileSheetHeight, setMobileSheetHeight] = useState(0);

  useEffect(() => {
    const body = document.querySelector('body');

    const setBodyHeight = () => {
      setMobileSheetHeight(window.innerHeight - TOP_OFFSET || 0); // 40px offset from the top
    };

    const resizeObserver = new ResizeObserver(setBodyHeight);

    const startResizeObserve = () => {
      if (body) resizeObserver.observe(body);
    };

    const stopResizeObserve = () => {
      if (body) resizeObserver.unobserve(body);
    };

    startResizeObserve();

    return stopResizeObserve;
  }, [theme.breakpoint.sm]);

  const closeDropdown = () => {
    setOpen(false);
  };

  const toggleDropdown = () => {
    setOpen(currentOpen => !currentOpen);
  };

  useEffect(() => {
    setUpdatedValue(value);
  }, [value]);

  const handleChange = (newOption: Option) => {
    setUpdatedValue(newOption);
    onChange?.(newOption);
    closeDropdown();
  };

  const localizedEmptyStateText =
    /** @ts-ignore - Type instantiation is excessively deep and possibly infinite */
    emptyStateText ?? (t('components.internal.base-select.empty-state-text-default') as string);
  const renderEmptyState = useCallback(
    () => <EmptyState>{localizedEmptyStateText}</EmptyState>,
    [localizedEmptyStateText],
  );

  return (
    <Container data-testid={testID} className="fp-dropdown">
      {label && (
        <Label tooltip={labelTooltip} htmlFor={id}>
          {label}
        </Label>
      )}
      {/* This input (invisible on the UI) helps make the browser autofill  work */}
      <input
        value={updatedValue?.value}
        onChange={ev => {
          const newVal = ev.target.value;
          const option = options.find(opt => opt.value === newVal);
          if (option && !disabled) {
            setUpdatedValue(option);
            onChange?.(option);
          }
        }}
        style={{ height: 0, width: 0, opacity: 0, position: 'absolute' }}
      />
      <div ref={setReferenceElement}>
        {renderTrigger?.({
          isOpen,
          onClick: toggleDropdown,
          selectedOption: updatedValue,
          size,
          testID: internalId,
        })}
      </div>
      {isOpen && !isMobile && (
        <div
          data-dd-privacy="mask"
          data-dd-action-name={`select-${internalId}`}
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
              Control: Control as React.ComponentType<ControlProps<Option, false, GroupBase<Option>>>,
              DropdownIndicator: null,
              IndicatorSeparator: null,
              MenuList: MenuList as React.ComponentType<MenuListProps<Option, false, GroupBase<Option>>>,
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
                ...createText(theme.typography['body-3']),
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
                ...createText(theme.typography['body-3']),
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
            // @ts-ignore: Type '(newOption: Option | null) => void' is not assignable to type '(newValue: unknown, actionMeta: ActionMeta<unknown>) => void'.
            onChange={handleChange}
            onMenuClose={closeDropdown}
            options={options}
            placeholder={
              searchPlaceholder ?? (t('components.internal.base-select.search-placeholder-default') as string)
            }
            value={updatedValue}
          />
        </div>
      )}
      {isMobile && (
        <Picker
          id={id}
          value={updatedValue}
          open={isOpen}
          placeholder={searchPlaceholder}
          onClose={closeDropdown}
          renderEmptyState={renderEmptyState}
          options={options}
          onChange={option => handleChange(option as Option)}
          height={mobileSheetHeight}
          OptionComponent={MobileOptionComponent}
        />
      )}
      {hint && <Hint hasError={hasError}>{hint}</Hint>}
    </Container>
  );
};

const Container = styled.div``;

export default BaseSelect;
