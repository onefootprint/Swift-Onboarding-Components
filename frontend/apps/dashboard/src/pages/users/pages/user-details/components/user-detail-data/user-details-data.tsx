import { Box, Divider } from '@onefootprint/ui';
import React from 'react';
import { UserWithVaultData } from 'src/pages/users/users.types';

import Timeline from './components/audit-trail';
import Insights from './components/insights';
import PinnedNotes from './components/pinned-notes';
import RiskSignals from './components/risk-signals';
import UserHeader from './components/user-header';
import VaultData from './components/vault-data';

type UserDetailsDataProps = {
  user: UserWithVaultData;
};

const UserDetailsData = ({ user }: UserDetailsDataProps) => (
  <>
    <UserHeader />
    <Box sx={{ marginY: 5 }}>
      <Divider />
    </Box>
    <PinnedNotes />
    <Box sx={{ marginBottom: 9 }}>
      <VaultData />
    </Box>
    {user.isPortable ? (
      <>
        <Box sx={{ marginBottom: 9 }}>
          <Timeline />
        </Box>
        <Box sx={{ marginBottom: 9 }}>
          <RiskSignals />
        </Box>
        <Box>
          <Insights />
        </Box>
      </>
    ) : null}
  </>
);

export default UserDetailsData;
