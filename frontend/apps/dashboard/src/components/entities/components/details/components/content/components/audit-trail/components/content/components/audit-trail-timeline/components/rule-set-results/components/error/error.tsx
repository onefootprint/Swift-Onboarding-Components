import { Box, Text } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  errorMessage: string;
};

const Error = ({ errorMessage }: ErrorProps) => (
  <Box>
    <Text variant="body-3">{errorMessage}</Text>
  </Box>
);

export default Error;
