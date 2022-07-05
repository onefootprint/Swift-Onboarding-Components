import React from 'react';
import Timeline from 'src/components/timeline';
import { User } from 'src/pages/users/hooks/use-join-users';
import { Box, Divider, Shimmer, Typography } from 'ui';

import auditTrailItem from './components/audit-trail-item';
import useGetAuditTrail from './hooks/use-get-audit-trail';

type AuditTrailProps = {
  user: User;
};

const AuditTrail = ({ user }: AuditTrailProps) => {
  const getAuditTrail = useGetAuditTrail(user.footprintUserId);
  return (
    <>
      <Typography variant="heading-3" sx={{ userSelect: 'none' }}>
        Audit trail
      </Typography>
      <Box sx={{ marginTop: 5, marginBottom: 5 }}>
        <Divider />
      </Box>
      {getAuditTrail.isLoading ? (
        <Shimmer sx={{ height: '100px' }} />
      ) : (
        <Timeline items={getAuditTrail.data?.map(auditTrailItem) || []} />
      )}
    </>
  );
};

export default AuditTrail;
