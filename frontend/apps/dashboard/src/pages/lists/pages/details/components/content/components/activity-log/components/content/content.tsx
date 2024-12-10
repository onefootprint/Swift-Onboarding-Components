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

  const items = timeline.reduce<TimelineItem[]>((acc, { timestamp, principal, detail }) => {
    const { kind } = detail;

    // TK - timeline events for createList and updateList
    if (kind === 'create_list_entry') {
      acc.push({
        timestamp,
        headerComponent: <ListEntryCreatedEventHeader principal={principal} event={detail} />,
      });
    } else if (kind === 'delete_list_entry') {
      acc.push({
        timestamp,
        headerComponent: <ListEntryDeletedEventHeader principal={principal} event={detail} />,
      });
    }
    return acc;
  }, []);

  return items.length > 0 ? (
    <div className="w-full">
      <Timeline items={items} />
    </div>
  ) : (
    <div className="text-center text-body-3 text-tertiary">{t('empty')}</div>
  );
};

export default Content;
