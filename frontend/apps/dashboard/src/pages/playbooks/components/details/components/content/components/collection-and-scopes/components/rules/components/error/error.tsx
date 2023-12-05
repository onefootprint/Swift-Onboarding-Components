import { getErrorMessage } from '@onefootprint/request';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  error: unknown;
};

const Error = ({ error }: ErrorProps) => (
  <Box>
    <Typography variant="body-3">{getErrorMessage(error)}</Typography>
  </Box>
);

export default Error;
