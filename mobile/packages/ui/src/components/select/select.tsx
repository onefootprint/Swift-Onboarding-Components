import { IcoChevronDown16 } from '@onefootprint/icons';
import React, { useState } from 'react';

import { Box } from '../box';
import { Flag } from '../flag';
import { Hint } from '../hint';
import { Label } from '../label';
import { Pressable } from '../pressable';
import { Typography } from '../typography';
import Picker from './components/picker';

export type SelectProps = {
  hasError?: boolean;
  hint?: string;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  value: any;
  emptyStateText?: string;
};

const Select = ({
  placeholder = 'Select...',
  hasError,
  hint,
  label,
  searchPlaceholder = 'Search...',
  emptyStateText = 'No results found',
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
            <Flag code="US" />
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
        emptyStateText={emptyStateText}
        onClose={hidePicker}
        open={open}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
      />
    </Box>
  );
};

export default Select;
