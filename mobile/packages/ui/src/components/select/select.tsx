import { IcoChevronDown16 } from '@onefootprint/icons';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import type { TextInputProps } from 'react-native';

import Box from '../box';
import Hint from '../hint';
import Label from '../label';
import Pressable from '../pressable';
import Typography from '../typography';
import Picker from './components/picker';
import type { BaseOption, SelectOption } from './select.types';

export type SelectProps<T extends BaseOption = BaseOption<string>> = {
  disabled?: boolean;
  emptyStateResetText?: string;
  emptyStateText?: string;
  hasError?: boolean;
  hint?: string;
  label?: string;
  onBlur?: () => void;
  onChange?: (newValue: SelectOption<T>) => void;
  onFocus?: () => void;
  options?: SelectOption<T>[];
  placeholder?: string;
  renderTrigger?: (placeholder: string, selectedOption?: SelectOption<T>) => React.ReactNode;
  searchInputProps?: TextInputProps;
  searchTitle?: string;
  value?: SelectOption<T>;
};

export type SelectRef = {
  focus: () => void;
  blur: () => void;
};

const Select = <T extends BaseOption = BaseOption<string>>(
  {
    disabled,
    emptyStateResetText = 'Reset search',
    emptyStateText = 'No results found',
    hasError,
    hint,
    label,
    onBlur,
    onChange,
    onFocus,
    options = [],
    placeholder = 'Select...',
    renderTrigger,
    searchInputProps,
    searchTitle = 'Search...',
    value,
  }: SelectProps<T>,
  ref: React.Ref<SelectRef>,
) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false);
  const selectedValueText = value ? value.label : placeholder;

  const showPicker = () => {
    onFocus?.();
    setOpen(true);
  };

  const hidePicker = () => {
    onBlur?.();
    setOpen(false);
  };

  const handleChange = (newValue: SelectOption<T>) => {
    onChange?.(newValue);
    hidePicker();
  };

  useImperativeHandle(ref, () => ({
    focus: showPicker,
    blur: hidePicker,
  }));

  return (
    <Box>
      {label && (
        <Label marginBottom={3} onPress={showPicker}>
          {label}
        </Label>
      )}
      <Pressable
        disabled={disabled}
        onPress={showPicker}
        onPressIn={() => setActive(true)}
        onPressOut={() => setActive(false)}
      >
        <Box
          alignItems="center"
          backgroundColor={active || disabled ? 'secondary' : 'primary'}
          borderColor="primary"
          borderRadius="default"
          borderWidth={1}
          flexDirection="row"
          height={48}
          justifyContent="space-between"
          paddingHorizontal={5}
        >
          {renderTrigger ? (
            renderTrigger(placeholder, value)
          ) : (
            <Typography variant="body-3">{selectedValueText || placeholder}</Typography>
          )}
          <IcoChevronDown16 />
        </Box>
      </Pressable>
      {!!hint && (
        <Hint marginTop={3} hasError={hasError}>
          {hint}
        </Hint>
      )}
      <Picker<T>
        emptyStateResetText={emptyStateResetText}
        emptyStateText={emptyStateText}
        onChange={handleChange}
        onClose={hidePicker}
        open={open}
        options={options}
        searchInputProps={searchInputProps}
        title={searchTitle}
        value={value}
      />
    </Box>
  );
};

export default forwardRef(Select) as <T extends BaseOption = BaseOption<string>>(
  props: SelectProps<T> & React.RefAttributes<SelectRef>,
) => JSX.Element;
