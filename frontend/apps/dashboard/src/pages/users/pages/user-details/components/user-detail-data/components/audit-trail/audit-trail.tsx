import { useTranslation } from '@onefootprint/hooks';
import { Box, Divider, Typography } from '@onefootprint/ui';
import React from 'react';
import useUser from 'src/hooks/use-user';

import useUserId from '../../../../hooks/use-user-id';
import AuditTrailTimeline from './components/audit-trail-timeline';

const AuditTrail = () => {
  const { t } = useTranslation('pages.user-details.audit-trail');
  const userId = useUserId();
  const {
    user: { timeline },
    loadingStates,
  } = useUser(userId);

  // Add an id on the container because the ManualReviewBanner supports
  // auto-scrolling this component into view
  return (
    <div id="audit-trail">
      <Typography variant="label-1" as="h2">
        {t('title')}
      </Typography>
      <Box sx={{ marginTop: 5, marginBottom: 5 }}>
        <Divider />
      </Box>
      <AuditTrailTimeline
        timeline={timeline?.events || []}
        isLoading={loadingStates.timeline}
      />
    </div>
  );
};

export default AuditTrail;
