import { Box, Text } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  message: string;
};

const ErrorComponent = ({ message }: ErrorProps) => (
  <Box testID="members-roles-error">
    <Text variant="body-3">{message}</Text>
  </Box>
);

export default ErrorComponent;
