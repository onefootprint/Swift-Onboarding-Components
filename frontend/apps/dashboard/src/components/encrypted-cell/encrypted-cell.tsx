import { IcoLock16 } from '@onefootprint/icons';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';

const EncryptedCell = () => (
  <Stack align="center" justify="flex-start" gap={3}>
    <Stack align="center" marginRight={2}>
      <IcoLock16 />
    </Stack>
    <Typography variant="body-3" color="primary" sx={{ userSelect: 'none' }}>
      •••••••••
    </Typography>
  </Stack>
);

export default EncryptedCell;
