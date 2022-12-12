import { useTranslation } from '@onefootprint/hooks';
import { Box, Divider, Typography } from '@onefootprint/ui';
import React from 'react';

import AuditTrailTimeline from './components/audit-trail-timeline';
import useGetTimeline from './hooks/use-get-timeline';

const AuditTrail = () => {
  const { t } = useTranslation('pages.user-details.audit-trail');
  const timelineQuery = useGetTimeline();

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
        timeline={timelineQuery.data || []}
        isLoading={timelineQuery.isLoading}
      />
    </div>
  );
};

export default AuditTrail;
