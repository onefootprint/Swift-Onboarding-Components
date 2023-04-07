import { useTranslation } from '@onefootprint/hooks';
import { Typography } from '@onefootprint/ui';
import React from 'react';

const WatchlistCheckEventHeader = () => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.watchlist-check-event',
  );

  return (
    <Typography variant="label-3" testID="watchlist-check-event-header">
      {t('title')}
    </Typography>
  );
};

export default WatchlistCheckEventHeader;
