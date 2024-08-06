import type {
  ListEntryCreatedEvent,
  ListEntryDeletedEvent,
  ListTimeline,
  ListTimelineEvent,
} from '@onefootprint/types';
import { ListTimelineEventKind } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import type { TimelineItem } from 'src/components/timeline';
import Timeline from 'src/components/timeline';

import ListEntryCreatedHeader from './components/list-entry-created-event-header';
import ListEntryDeletedHeader from './components/list-entry-deleted-event-header';

type ContentProps = {
  timeline: ListTimeline;
};

const Content = ({ timeline }: ContentProps) => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.activity-log',
  });

  const items: TimelineItem[] = [];
  timeline.forEach(({ timestamp, principal, detail }: ListTimelineEvent) => {
    const { kind } = detail;

    // TODO: uncomment when backend adds support for these event types
    // if (kind === ListTimelineEventKind.createList) {
    //   items.push({
    //     time: { timestamp },
    //     headerComponent: (
    //       <ListCreatedEventHeader
    //         user={principal.member}
    //         event={detail as ListCreatedEvent}
    //       />
    //     ),
    //   });
    // } else if (kind === ListTimelineEventKind.updateList) {
    //   items.push({
    //     time: { timestamp },
    //     headerComponent: (
    //       <ListUpdatedEventHeader
    //         user={principal.member}
    //         event={detail as ListUpdatedEvent}
    //       />
    //     ),
    //   });
    // } else
    if (kind === ListTimelineEventKind.createListEntry) {
      items.push({
        time: { timestamp },
        headerComponent: <ListEntryCreatedHeader user={principal.member} event={detail as ListEntryCreatedEvent} />,
      });
    } else if (kind === ListTimelineEventKind.deleteListEntry) {
      items.push({
        time: { timestamp },
        headerComponent: <ListEntryDeletedHeader user={principal.member} event={detail as ListEntryDeletedEvent} />,
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
