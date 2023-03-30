import { Typography } from '@onefootprint/ui';
import React from 'react';

export type FieldProps = {
  label: string;
  children: React.ReactNode;
};

const Field = ({ label, children }: FieldProps) => (
  <div role="row" aria-label={label}>
    <Typography
      variant="label-3"
      color="tertiary"
      sx={{ marginBottom: 3 }}
      as="div"
    >
      {label}
    </Typography>
    <Typography variant="body-3" as="div">
      {children}
    </Typography>
  </div>
);

export default Field;
