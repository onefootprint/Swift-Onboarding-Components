import IcoLock16 from 'icons/ico/ico-lock-16';
import React from 'react';
import { Box, LoadingIndicator, Typography } from 'ui';

type EncryptedCellProps = {
  isLoading: boolean;
};

const EncryptedCell = ({ isLoading }: EncryptedCellProps) => (
  <Box sx={{ display: 'flex' }}>
    <Box sx={{ marginRight: 2 }}>
      {/* TODO https://linear.app/footprint/issue/FP-239/add-a-shimmer-effect-for-loading-encrypted-fields */}
      {isLoading ? <LoadingIndicator size="compact" /> : <IcoLock16 />}
    </Box>
    <Typography variant="body-3" color="primary" sx={{ userSelect: 'none' }}>
      •••••••••
    </Typography>
  </Box>
);

export default EncryptedCell;
