import type { ListEventDetailDeleteListEntry } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import Pill from '../pill';

type ListEntryDeletedEventHeaderProps = {
  user: string;
  event: ListEventDetailDeleteListEntry;
};

const ListEntryDeletedEventHeader = ({ user, event }: ListEntryDeletedEventHeaderProps) => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.activity-log.delete-list-entry',
  });

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-h-[32px]">
      <span className="text-label-3">{user}</span>
      <span className="text-body-3 text-tertiary">{t('verb')}</span>
      <Pill className="h-[32px]">{event.data.entry}</Pill>
    </div>
  );
};

export default ListEntryDeletedEventHeader;
