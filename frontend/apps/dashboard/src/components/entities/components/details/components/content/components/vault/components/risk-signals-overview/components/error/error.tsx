import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  children: string;
};

const Error = ({ children }: ErrorProps) => (
  <Box>
    <Typography variant="label-3">{children}</Typography>
  </Box>
);

export default Error;
