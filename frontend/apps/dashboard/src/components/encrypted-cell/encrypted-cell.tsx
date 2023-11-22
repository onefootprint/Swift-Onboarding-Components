import { IcoLock16 } from '@onefootprint/icons';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';

type EncryptedCellProps = {
  prefix?: string;
};

const EncryptedCell = ({ prefix }: EncryptedCellProps) => (
  <Stack align="center" justify="space-between" gap={3} minWidth="88px">
    <Stack align="center" marginRight={2}>
      <IcoLock16 />
    </Stack>
    <Stack>
      <Typography variant="body-3" color="primary" sx={{ userSelect: 'none' }}>
        {`${prefix ?? '•'}••••••••`}
      </Typography>
    </Stack>
  </Stack>
);

export default EncryptedCell;
