import { getErrorMessage } from '@onefootprint/request';
import { Box, Text } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  error: unknown;
};

const Error = ({ error }: ErrorProps) => (
  <Box>
    <Text variant="body-3">{getErrorMessage(error)}</Text>
  </Box>
);

export default Error;
