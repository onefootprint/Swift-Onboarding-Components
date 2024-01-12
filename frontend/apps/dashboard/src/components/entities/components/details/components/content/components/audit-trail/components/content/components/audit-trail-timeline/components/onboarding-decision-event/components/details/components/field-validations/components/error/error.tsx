import { IcoWarning16 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  error: unknown;
};

const Error = ({ error }: ErrorProps) => (
  <Stack marginLeft={13} align="center">
    <IcoWarning16 />
    <Typography variant="body-3" sx={{ marginLeft: 2 }}>
      {getErrorMessage(error)}
    </Typography>
  </Stack>
);

export default Error;
