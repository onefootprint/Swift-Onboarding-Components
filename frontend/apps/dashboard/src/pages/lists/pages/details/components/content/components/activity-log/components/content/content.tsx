import type { ListEvent } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import type { TimelineItem } from 'src/components/timeline';
import Timeline from 'src/components/timeline';
import ListEntryCreatedEventHeader from './components/list-entry-created-event-header';
import ListEntryDeletedEventHeader from './components/list-entry-deleted-event-header';

type ContentProps = {
  timeline: ListEvent[];
};

const Content = ({ timeline }: ContentProps) => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.activity-log',
  });

  const items: TimelineItem[] = [];

  timeline.forEach(({ timestamp, principal, detail }: ListEvent) => {
    const { kind } = detail;

    // TK - timeline events for createList and updateList
    if (kind === 'create_list_entry' && principal?.kind === 'user') {
      items.push({
        timestamp,
        // TK - possibly come back, not sure if we actually want to pass the ID
        // down as the name / what was supposed to be here
        // still can't see any of this so unclear
        headerComponent: <ListEntryCreatedEventHeader user={principal.id} event={detail} />,
      });
    } else if (kind === 'delete_list_entry' && principal?.kind === 'user') {
      items.push({
        timestamp,
        headerComponent: <ListEntryDeletedEventHeader user={principal.id} event={detail} />,
      });
    }
  });

  return timeline.length > 0 ? (
    <div className="w-full">
      <Timeline items={items} />
    </div>
  ) : (
    <div className="text-center text-body-3 text-tertiary">{t('empty')}</div>
  );
};

export default Content;
