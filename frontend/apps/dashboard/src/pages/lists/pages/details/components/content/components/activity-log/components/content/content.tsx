import type {
  ListCreatedEvent,
  ListEntryCreatedEvent,
  ListEntryDeletedEvent,
  ListTimeline,
  ListTimelineEvent,
  ListUpdatedEvent,
} from '@onefootprint/types';
import { ListTimelineEventKind } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TimelineItem } from 'src/components/timeline';
import Timeline from 'src/components/timeline';

import ListCreatedEventHeader from './components/list-created-event-header';
import ListEntryCreatedHeader from './components/list-entry-created-event-header';
import ListEntryDeletedHeader from './components/list-entry-deleted-event-header';
import ListUpdatedEventHeader from './components/list-updated-event-header';

type ContentProps = {
  timeline: ListTimeline;
};

const Content = ({ timeline }: ContentProps) => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.activity-log',
  });

  const items: TimelineItem[] = [];
  timeline.forEach(({ event, timestamp }: ListTimelineEvent) => {
    const { kind, data } = event;

    if (kind === ListTimelineEventKind.listCreated) {
      items.push({
        time: { timestamp },
        headerComponent: (
          <ListCreatedEventHeader data={data as ListCreatedEvent} />
        ),
      });
    } else if (kind === ListTimelineEventKind.listUpdated) {
      items.push({
        time: { timestamp },
        headerComponent: (
          <ListUpdatedEventHeader data={data as ListUpdatedEvent} />
        ),
      });
    } else if (kind === ListTimelineEventKind.listEntryCreated) {
      items.push({
        time: { timestamp },
        headerComponent: (
          <ListEntryCreatedHeader data={data as ListEntryCreatedEvent} />
        ),
      });
    } else if (kind === ListTimelineEventKind.listEntryDeleted) {
      items.push({
        time: { timestamp },
        headerComponent: (
          <ListEntryDeletedHeader data={data as ListEntryDeletedEvent} />
        ),
      });
    }
  });

  return timeline.length > 0 ? (
    <Timeline items={items} />
  ) : (
    <Text variant="body-3" color="tertiary">
      {t('empty')}
    </Text>
  );
};

export default Content;
