import { useTranslation } from '@onefootprint/hooks';
import { Typography } from '@onefootprint/ui';
import React from 'react';

const AbandonedEventHeader = () => {
  const { t } = useTranslation(
    'pages.user-details.audit-trail.timeline.abandoned-event',
  );

  return (
    <Typography variant="label-3" color="warning">
      {t('title')}
    </Typography>
  );
};

export default AbandonedEventHeader;
