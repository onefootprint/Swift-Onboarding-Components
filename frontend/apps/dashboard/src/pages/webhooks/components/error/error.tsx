import { Text } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  message: string;
};

const Error = ({ message }: ErrorProps) => (
  <Text color="secondary" variant="body-2">
    {message}
  </Text>
);

export default Error;
