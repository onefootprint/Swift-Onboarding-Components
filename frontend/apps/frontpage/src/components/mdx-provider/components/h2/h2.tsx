import { Typography } from '@onefootprint/ui';
import React from 'react';

type H2Props = {
  children: React.ReactNode;
};

const H2 = ({ children }: H2Props) => (
  <Typography variant="display-3" color="primary" sx={{ marginBottom: 9 }}>
    {children}
  </Typography>
);

export default H2;
