import type { PreviousWatchlistChecksEventData } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import PreviousWatchlistCheckEvents from './components/previous-watchlist-check-events';

type WatchlistCheckEventHeaderProps = {
  data: PreviousWatchlistChecksEventData;
};

const WatchlistCheckEventHeader = ({
  data,
}: WatchlistCheckEventHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.watchlist-check-event',
  });

  return (
    <>
      <Typography variant="label-3" testID="watchlist-check-event-header">
        {t('title')}
      </Typography>
      <PreviousWatchlistCheckEvents data={data} />
    </>
  );
};

export default WatchlistCheckEventHeader;
