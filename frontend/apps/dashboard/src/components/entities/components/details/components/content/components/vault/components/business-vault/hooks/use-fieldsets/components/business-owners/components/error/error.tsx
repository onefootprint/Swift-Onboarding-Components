import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  message: string;
};

const Error = ({ message }: ErrorProps) => (
  <Box testID="business-owners-error">
    <Typography variant="body-3">{message}</Typography>
  </Box>
);

export default Error;
