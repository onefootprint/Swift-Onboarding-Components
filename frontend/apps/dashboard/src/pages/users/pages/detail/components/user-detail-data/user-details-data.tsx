import React from 'react';
import UserHeader from 'src/pages/users/pages/detail/components/user-detail-data/components/user-header';
import { Box, Divider } from 'ui';

import AuditTrail from './components/audit-trail';
import BasicInfo from './components/basic-info';
import Insights from './components/insights';

type UserDetailsDataProps = {
  user: any;
  onDecrypt: any;
};

const UserDetailsData = ({ user, onDecrypt }: UserDetailsDataProps) => (
  <>
    <UserHeader user={user} onDecrypt={onDecrypt} />
    <Box sx={{ marginTop: 5, marginBottom: 5 }}>
      <Divider />
    </Box>
    <BasicInfo user={user} />
    <Box sx={{ height: '40px' }}>&nbsp;</Box>
    {user.isPortable ? <AuditTrail user={user} /> : null}
    <Box sx={{ height: '40px' }}>&nbsp;</Box>
    {user.isPortable ? <Insights user={user} /> : null}
    <Box sx={{ height: '72px' }}>&nbsp;</Box>
  </>
);

export default UserDetailsData;
