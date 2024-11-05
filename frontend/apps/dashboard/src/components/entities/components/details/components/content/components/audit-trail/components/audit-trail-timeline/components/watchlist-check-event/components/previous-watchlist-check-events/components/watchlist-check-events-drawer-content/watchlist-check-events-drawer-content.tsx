import type { PreviousWatchlistChecksEventData, WatchlistCheckEventData } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Timeline from 'src/components/timeline';

import WatchlistCheckEventBody from '../../../../watchlist-check-event-body';
import WatchlistCheckEventIcon from '../../../../watchlist-check-event-icon';

type WatchlistCheckEventsDrawerContentProp = {
  data: PreviousWatchlistChecksEventData;
};

const WatchlistCheckEventsDrawerContent = ({ data }: WatchlistCheckEventsDrawerContentProp) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.watchlist-check-event',
  });
  const timelineItems = data.map(event => {
    const { watchlistEvent, timestamp } = event;
    const eventData = watchlistEvent.data as WatchlistCheckEventData;

    return {
      headerComponent: (
        <Stack justify="space-between" align="center" width="100%">
          <Text variant="label-3" testID="watchlist-check-event-header">
            {t('drawer-title')}
          </Text>
          <Stack gap={2}>
            <Text variant="body-3" color="tertiary">
              {`${new Date(timestamp).toLocaleString('en-us', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
              })},`}
            </Text>
            <Text variant="body-3" color="tertiary">
              {new Date(timestamp).toLocaleString('en-us', {
                hour: 'numeric',
                minute: 'numeric',
              })}
            </Text>
          </Stack>
        </Stack>
      ),
      bodyComponent: <WatchlistCheckEventBody data={eventData} lineHeight="default" showIcons />,
      iconComponent: <WatchlistCheckEventIcon />,
    };
  });

  return <Timeline items={timelineItems} />;
};

export default WatchlistCheckEventsDrawerContent;
