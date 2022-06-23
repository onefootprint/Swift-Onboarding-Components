import IcoLock16 from 'icons/ico/ico-lock-16';
import React from 'react';
import { Box, Typography } from 'ui';

const EncryptedCell = () => (
  <Box sx={{ display: 'flex' }}>
    <Box sx={{ marginRight: 2 }}>
      <IcoLock16 />
    </Box>
    <Typography variant="body-3" color="primary" sx={{ userSelect: 'none' }}>
      •••••••••
    </Typography>
  </Box>
);

export default EncryptedCell;
