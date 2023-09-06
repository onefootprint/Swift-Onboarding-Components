import type { SXStyleProps } from '@onefootprint/ui';
import { Typography } from '@onefootprint/ui';
import React from 'react';

export type FieldProps = {
  label: string;
  children: React.ReactNode;
  childrenSx?: SXStyleProps;
};

const Field = ({ label, children, childrenSx }: FieldProps) => (
  <div role="row" aria-label={label}>
    <Typography
      variant="label-3"
      color="tertiary"
      sx={{ marginBottom: 3 }}
      as="div"
    >
      {label}
    </Typography>
    <Typography variant="body-3" as="div" sx={childrenSx}>
      {children}
    </Typography>
  </div>
);

export default Field;
