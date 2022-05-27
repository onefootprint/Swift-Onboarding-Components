import React from 'react';
import { Typography } from 'ui';

type PProps = {
  children: React.ReactNode;
};

const P = ({ children }: PProps) => (
  <Typography variant="body-2" color="secondary" sx={{ marginBottom: 9 }}>
    {children}
  </Typography>
);

export default P;
