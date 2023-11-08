import { getErrorMessage } from '@onefootprint/request';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  error: unknown;
};

const Error = ({ error }: ErrorProps) => (
  <Typography variant="body-2" color="secondary">
    {getErrorMessage(error)}
  </Typography>
);

export default Error;
