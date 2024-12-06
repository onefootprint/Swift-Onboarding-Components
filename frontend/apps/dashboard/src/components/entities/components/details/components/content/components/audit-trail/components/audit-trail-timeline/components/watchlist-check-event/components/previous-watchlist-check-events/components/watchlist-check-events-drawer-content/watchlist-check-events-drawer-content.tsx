import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Timeline from 'src/components/timeline';

import useEntityId from 'src/components/entities/components/details/hooks/use-entity-id';
import useEntityTimeline from 'src/components/entities/components/details/hooks/use-entity-timeline';
import WatchlistCheckEventBody from '../../../../watchlist-check-event-body';
import WatchlistCheckEventIcon from '../../../../watchlist-check-event-icon';

const WatchlistCheckEventsDrawerContent = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.watchlist-check-event',
  });
  const id = useEntityId();
  // @ts-expect-error: TODO: this type is incorrect, the backend accepts a single comma-separated string
  const { data, hasNextPage, fetchNextPage } = useEntityTimeline(id, { kinds: 'watchlist_check' }, true);

  const timelineItems = data?.flatMap(event => {
    const {
      event: { data: eventData, kind },
      timestamp,
    } = event;
    if (kind !== 'watchlist_check') {
      return [];
    }

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

  return <Timeline items={timelineItems || []} pagination={{ hasNextPage, fetchNextPage }} />;
};

export default WatchlistCheckEventsDrawerContent;
