import { Typography } from '@onefootprint/ui';
import React from 'react';

type PProps = {
  children: React.ReactNode;
};

const P = ({ children }: PProps) => (
  <Typography variant="body-2" color="secondary" sx={{ marginBottom: 9 }}>
    {children}
  </Typography>
);

export default P;
