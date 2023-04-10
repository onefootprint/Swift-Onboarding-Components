import { getErrorMessage } from '@onefootprint/request';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  error: unknown;
  testID?: string;
};

const Error = ({ error, testID }: ErrorProps) => (
  <Box testID={testID}>
    <Typography variant="body-3">{getErrorMessage(error)}</Typography>
  </Box>
);

export default Error;
