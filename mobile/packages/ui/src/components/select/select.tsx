import { IcoChevronDown16 } from '@onefootprint/icons';
import React from 'react';

import { Box } from '../box';
import { Flag } from '../flag';
import { Label } from '../label';
import { Typography } from '../typography';

export type SelectProps = {
  // disabled?: boolean;
  // hasError?: boolean;
  // hint?: string;
  label?: string;
  // id?: string;
  // onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  // searchPlaceholder?: string;
  value: any;
  // emptyStateText?: string;
};

const Select = ({
  placeholder = 'Select...',
  // disabled,
  // hasError,
  // hint,
  // label,
  // id,
  // onChange,
  // searchPlaceholder,
  value,
}: // emptyStateText,
SelectProps) => {
  const selectedValueText = value ? value.label : placeholder;

  const handleLabelPress = () => {};

  return (
    <Box>
      <Label onPress={handleLabelPress} marginBottom={3}>
        Country
      </Label>
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
    </Box>
  );
};

export default Select;
