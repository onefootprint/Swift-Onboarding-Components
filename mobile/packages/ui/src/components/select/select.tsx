import { IcoChevronDown16 } from '@onefootprint/icons';
import React, { useState } from 'react';

import { Box } from '../box';
import { Hint } from '../hint';
import { Label } from '../label';
import { Pressable } from '../pressable';
import { Typography } from '../typography';
import Picker from './components/picker';
import type { BaseOption, SelectOption } from './select.types';

export type SelectProps<T extends BaseOption = BaseOption<string>> = {
  disabled?: boolean;
  emptyStateResetText?: string;
  emptyStateTitle?: string;
  hasError?: boolean;
  hint?: string;
  label?: string;
  onChange?: (newValue: SelectOption<T>) => void;
  options?: SelectOption<T>[];
  placeholder?: string;
  renderTrigger?: (
    placeholder: string,
    selectedOption?: SelectOption<T>,
  ) => React.ReactNode;
  searchPlaceholder?: string;
  value?: SelectOption<T>;
};

const Select = <T extends BaseOption = BaseOption<string>>({
  disabled,
  emptyStateResetText = 'Reset search',
  emptyStateTitle = 'No results found',
  hasError,
  hint,
  label,
  onChange,
  options = [],
  placeholder = 'Select...',
  renderTrigger,
  searchPlaceholder = 'Search...',
  value,
}: SelectProps<T>) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false);
  const selectedValueText = value ? value.label : placeholder;

  const showPicker = () => {
    setOpen(true);
  };

  const hidePicker = () => {
    setOpen(false);
  };

  const handleChange = (newValue: SelectOption<T>) => {
    onChange?.(newValue);
    hidePicker();
  };

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
        withImpact
      >
        <Box
          alignItems="center"
          backgroundColor={active || disabled ? 'secondary' : 'primary'}
          borderColor="primary"
          borderRadius="default"
          borderStyle="solid"
          borderWidth={1}
          flexDirection="row"
          height={48}
          justifyContent="space-between"
          paddingHorizontal={5}
        >
          {renderTrigger ? (
            renderTrigger(placeholder, value)
          ) : (
            <Typography variant="body-4">
              {selectedValueText || placeholder}
            </Typography>
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
        emptyStateTitle={emptyStateTitle}
        onChange={handleChange}
        onClose={hidePicker}
        open={open}
        options={options}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        value={value}
      />
    </Box>
  );
};

export default Select;
