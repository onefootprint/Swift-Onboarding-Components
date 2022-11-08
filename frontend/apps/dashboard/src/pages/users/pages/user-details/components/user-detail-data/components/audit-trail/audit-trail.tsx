import { useTranslation } from '@onefootprint/hooks';
import { Box, Divider, Typography } from '@onefootprint/ui';
import React from 'react';
import { User } from 'src/pages/users/types/user.types';

import AuditTrailTimeline from './components/audit-trail-timeline';
import useGetTimeline from './hooks/use-get-timeline';

type AuditTrailProps = {
  user: User;
};

const AuditTrail = ({ user }: AuditTrailProps) => {
  const { t } = useTranslation('pages.user-details.audit-trail');
  const getTimeline = useGetTimeline(user.id);

  return (
    <>
      <Typography variant="label-1" as="h2">
        {t('title')}
      </Typography>
      <Box sx={{ marginTop: 5, marginBottom: 5 }}>
        <Divider />
      </Box>
      <AuditTrailTimeline
        timeline={getTimeline.data ?? []}
        isLoading={getTimeline.isLoading}
      />
    </>
  );
};

export default AuditTrail;
