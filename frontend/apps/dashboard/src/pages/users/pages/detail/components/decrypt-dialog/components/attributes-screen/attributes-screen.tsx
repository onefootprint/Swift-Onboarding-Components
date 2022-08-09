import React, { ChangeEvent } from 'react';
import DataKindBoxes from 'src/components/data-kind-boxes';
import type { DataKind } from 'src/types';
import { Box, Checkbox, Divider, Typography } from 'ui';

type AttributesScreenProps = {
  hasError: boolean;
  isFieldSelected: (...kinds: DataKind[]) => boolean;
  setFieldFor: (
    ...kinds: DataKind[]
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
  isFieldDisabled: (...kinds: DataKind[]) => boolean;
  allDecryptableFields: DataKind[];
};

const AttributesScreen = ({
  hasError,
  isFieldSelected,
  setFieldFor,
  isFieldDisabled,
  allDecryptableFields,
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
        disabled={isFieldDisabled(...allDecryptableFields)}
        checked={isFieldSelected(...allDecryptableFields)}
        onChange={setFieldFor(...allDecryptableFields)}
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
