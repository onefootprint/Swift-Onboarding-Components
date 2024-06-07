import { IcoWarning16 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  error: unknown;
};

const ErrorComponent = ({ error }: ErrorProps) => (
  <Stack marginLeft={13} align="center">
    <IcoWarning16 />
    <Text variant="body-3" marginLeft={2}>
      {getErrorMessage(error)}
    </Text>
  </Stack>
);

export default ErrorComponent;
