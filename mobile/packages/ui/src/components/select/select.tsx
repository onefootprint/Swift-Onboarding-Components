import { COUNTRIES } from '@onefootprint/global-constants';
import { IcoChevronDown16 } from '@onefootprint/icons';
import React, { useState } from 'react';

import { Box } from '../box';
import { Hint } from '../hint';
import { Label } from '../label';
import { Pressable } from '../pressable';
import { Typography } from '../typography';
import Picker from './components/picker';
import { SelectOption } from './select.types';

export type SelectProps = {
  emptyStateResetText?: string;
  emptyStateTitle?: string;
  hasError?: boolean;
  hint?: string;
  label?: string;
  onChange?: (newValue: SelectOption) => void;
  options?: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  value?: SelectOption;
};

const Select = ({
  emptyStateResetText = 'Reset search',
  emptyStateTitle = 'No results found',
  hasError,
  hint,
  label,
  onChange,
  options = COUNTRIES,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  value,
}: SelectProps) => {
  const [open, setOpen] = useState(false);
  const selectedValueText = value ? value.label : placeholder;

  const showPicker = () => {
    setOpen(true);
  };

  const hidePicker = () => {
    setOpen(false);
  };

  const handleChange = (newValue: SelectOption) => {
    onChange?.(newValue);
    hidePicker();
  };

  return (
    <Box>
      <Pressable onPress={showPicker} withImpact>
        {label && (
          <Label marginBottom={3} onPress={showPicker}>
            {label}
          </Label>
        )}
        <Box
          alignItems="center"
          backgroundColor="primary"
          borderColor="primary"
          borderRadius="default"
          borderStyle="solid"
          borderWidth={1}
          flexDirection="row"
          height={48}
          justifyContent="space-between"
          paddingHorizontal={5}
        >
          <Box gap={4} flexDirection="row" center>
            <Typography variant="body-4">
              {selectedValueText || placeholder}
            </Typography>
          </Box>
          <IcoChevronDown16 />
        </Box>
      </Pressable>
      {!!hint && (
        <Hint marginTop={3} hasError={hasError}>
          {hint}
        </Hint>
      )}
      <Picker
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
