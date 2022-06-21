import React, { ChangeEvent } from 'react';
import DataKindBoxes from 'src/components/data-kind-boxes';
import { ALL_FIELDS, DataKindType } from 'src/types';
import { Box, Checkbox, Divider, Typography } from 'ui';

type AttributesScreenProps = {
  hasError: boolean;
  isFieldSelected: (...kinds: DataKindType[]) => boolean;
  setFieldFor: (
    ...kinds: DataKindType[]
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
  isFieldDisabled: (...kinds: DataKindType[]) => boolean;
};

const AttributesScreen = ({
  hasError,
  isFieldSelected,
  setFieldFor,
  isFieldDisabled,
}: AttributesScreenProps) => (
  <>
    <Typography variant="label-1">
      What data would you like to decrypt?
    </Typography>
    {hasError && (
      <Typography variant="caption-1" color="error" sx={{ marginTop: 3 }}>
        Choose at least one data attribute to continue.
      </Typography>
    )}
    <Box sx={{ marginTop: 7, marginBottom: 7 }}>
      <Checkbox
        label="All"
        disabled={isFieldDisabled(...ALL_FIELDS)}
        checked={isFieldSelected(...ALL_FIELDS)}
        onChange={setFieldFor(...ALL_FIELDS)}
      />
    </Box>
    <Divider />
    <Box sx={{ marginTop: 7 }}>
      <DataKindBoxes
        isFieldDisabled={isFieldDisabled}
        isFieldSelected={isFieldSelected}
        setFieldFor={setFieldFor}
      />
    </Box>
  </>
);

export default AttributesScreen;
