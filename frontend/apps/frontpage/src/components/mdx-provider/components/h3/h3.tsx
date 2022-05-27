import React from 'react';
import { Typography } from 'ui';

type H3Props = {
  children: React.ReactNode;
};

const H3 = ({ children }: H3Props) => (
  <Typography variant="heading-3" color="primary" sx={{ marginBottom: 3 }}>
    {children}
  </Typography>
);

export default H3;
