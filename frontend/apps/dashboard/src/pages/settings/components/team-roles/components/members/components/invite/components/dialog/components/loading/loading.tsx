import { Box, Shimmer } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box testID="members-roles-loading" sx={{ width: '100%' }}>
    <Box sx={{ display: 'flex', gap: 4, marginBottom: 5 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <EmailLabel />
        <EmailInput />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <RoleLabel />
        <RoleInput />
      </Box>
    </Box>
    <AddMoreButton />
  </Box>
);

const EmailLabel = () => <Shimmer sx={{ height: '20px', width: '93px' }} />;

const EmailInput = () => <Shimmer sx={{ height: '40px', width: '395px' }} />;

const RoleLabel = () => <Shimmer sx={{ height: '20px', width: '93px' }} />;

const RoleInput = () => <Shimmer sx={{ height: '40px', width: '194px' }} />;

const AddMoreButton = () => <Shimmer sx={{ height: '21px', width: '86px' }} />;

export default Loading;
