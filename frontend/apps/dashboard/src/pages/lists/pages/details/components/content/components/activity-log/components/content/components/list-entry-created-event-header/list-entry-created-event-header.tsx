import type { ListEventDetailCreateListEntry } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import Pill from '../pill';

type ListEntryCreatedEventHeaderProps = {
  user: string;
  event: ListEventDetailCreateListEntry;
};

const ListEntryCreatedEventHeader = ({ user, event }: ListEntryCreatedEventHeaderProps) => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.activity-log.create-list-entry',
  });

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-h-[32px]">
      <span className="text-label-3 inline-flex items-center h-[32px]">{user}</span>
      <span className="text-body-3 text-tertiary inline-flex items-center h-[32px]">{t('verb')}</span>
      {event.data.entries.map(e => (
        <Pill className="h-[32px]" key={e}>
          {e}
        </Pill>
      ))}
    </div>
  );
};

export default ListEntryCreatedEventHeader;
