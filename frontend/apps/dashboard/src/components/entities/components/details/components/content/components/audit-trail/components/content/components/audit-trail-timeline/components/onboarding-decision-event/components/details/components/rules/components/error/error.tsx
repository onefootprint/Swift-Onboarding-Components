import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  errorMessage: string;
};

const Error = ({ errorMessage }: ErrorProps) => (
  <Box>
    <Typography variant="body-3">{errorMessage}</Typography>
  </Box>
);

export default Error;
