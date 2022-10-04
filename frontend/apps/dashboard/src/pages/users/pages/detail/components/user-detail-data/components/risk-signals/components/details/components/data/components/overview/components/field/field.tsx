import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

type FieldProps = {
  label: string;
  value: string;
};

const Field = ({ label, value }: FieldProps) => (
  <Box>
    <Typography variant="label-3" color="tertiary" sx={{ marginBottom: 2 }}>
      {label}
    </Typography>
    <Typography variant="body-3">{value}</Typography>
  </Box>
);

export default Field;
