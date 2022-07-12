import React from 'react';
import { Box, Typography } from 'ui';

export type FieldProps = {
  label: string;
  value?: string | null;
};

const Field = ({ label, value }: FieldProps) => (
  <Box>
    <Typography variant="label-3" color="tertiary">
      {label}
    </Typography>
    <Typography variant="body-3" color="primary">
      {value || '-'}
    </Typography>
  </Box>
);

export default Field;
