import IcoLock16 from 'icons/ico/ico-lock-16';
import React from 'react';
import styled, { css } from 'styled';
import { Box, Typography } from 'ui';

const EncryptedCell = () => (
  <Box sx={{ display: 'flex' }}>
    <IcoLockContainer />
    <Typography variant="body-3" color="primary" sx={{ userSelect: 'none' }}>
      •••••••••
    </Typography>
  </Box>
);

export default EncryptedCell;

const IcoLockContainer = styled(IcoLock16)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[2]}px;
  `};
`;
