import { IcoLock16 } from '@onefootprint/icons';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

const EncryptedCell = () => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Box sx={{ marginRight: 2 }}>
      <IcoLock16 />
    </Box>
    <Typography variant="body-3" color="primary" sx={{ userSelect: 'none' }}>
      •••••••••
    </Typography>
  </Box>
);

export default EncryptedCell;
