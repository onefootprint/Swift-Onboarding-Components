import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

export type FieldsetProps = {
  label: string;
  value: string;
};

const Fieldset = ({ label, value }: FieldsetProps) => (
  <Box>
    <Typography variant="label-3" color="tertiary" sx={{ marginBottom: 2 }}>
      {label}
    </Typography>
    <Typography variant="body-3">{value}</Typography>
  </Box>
);

export default Fieldset;
