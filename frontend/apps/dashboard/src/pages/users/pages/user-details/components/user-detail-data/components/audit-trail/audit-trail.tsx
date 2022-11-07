import { useTranslation } from '@onefootprint/hooks';
import { Box, Divider, Shimmer, Typography } from '@onefootprint/ui';
import React from 'react';
import Timeline from 'src/components/timeline';
import { User } from 'src/pages/users/types/user.types';

import auditTrailItem from './components/audit-trail-item';
import useGetAuditTrail from './hooks/use-get-audit-trail';

type AuditTrailProps = {
  user: User;
};

const AuditTrail = ({ user }: AuditTrailProps) => {
  const { t } = useTranslation('pages.user-details.audit-trail');
  const getAuditTrail = useGetAuditTrail(user.id);

  return (
    <>
      <Typography variant="label-1" as="h2">
        {t('audit-trail')}
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
