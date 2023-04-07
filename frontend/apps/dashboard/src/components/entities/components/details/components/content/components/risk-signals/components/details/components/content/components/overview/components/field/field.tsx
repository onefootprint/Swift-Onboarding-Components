import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

const Field = ({ label, children }: FieldProps) => (
  <Box>
    <Typography variant="label-3" color="tertiary" sx={{ marginBottom: 2 }}>
      {label}
    </Typography>
    <Typography variant="body-3">{children}</Typography>
  </Box>
);

export default Field;
