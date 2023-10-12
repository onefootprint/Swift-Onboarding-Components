import { Typography } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  message: string;
};

const Error = ({ message }: ErrorProps) => (
  <Typography color="secondary" variant="body-2">
    {message}
  </Typography>
);

export default Error;
