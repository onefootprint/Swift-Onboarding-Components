import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import type {
  PreviousWatchlistChecksEventData,
  WatchlistCheckEventData,
} from '@onefootprint/types';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import Timeline from 'src/components/timeline';

import WatchlistCheckEventBody from '../../../../watchlist-check-event-body';
import WatchlistCheckEventIcon from '../../../../watchlist-check-event-icon';

type WatchlistCheckEventsDrawerContentProp = {
  data: PreviousWatchlistChecksEventData;
};

const WatchlistCheckEventsDrawerContent = ({
  data,
}: WatchlistCheckEventsDrawerContentProp) => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.watchlist-check-event',
  );
  const timelineItems = data.map(event => {
    const { watchlistEvent, timestamp } = event;
    const eventData = watchlistEvent.data as WatchlistCheckEventData;

    return {
      headerComponent: (
        <HeaderContainer>
          <Typography variant="label-3" testID="watchlist-check-event-header">
            {t('title')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="body-4" color="tertiary">
              {`${new Date(timestamp).toLocaleString('en-us', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
              })},`}
            </Typography>
            <Typography variant="body-4" color="tertiary">
              {new Date(timestamp).toLocaleString('en-us', {
                hour: 'numeric',
                minute: 'numeric',
              })}
            </Typography>
          </Box>
        </HeaderContainer>
      ),
      bodyComponent: (
        <WatchlistCheckEventBody data={eventData} lineHeight="default" />
      ),
      iconComponent: <WatchlistCheckEventIcon />,
    };
  });

  return <Timeline items={timelineItems} />;
};

const HeaderContainer = styled.div`
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export default WatchlistCheckEventsDrawerContent;
