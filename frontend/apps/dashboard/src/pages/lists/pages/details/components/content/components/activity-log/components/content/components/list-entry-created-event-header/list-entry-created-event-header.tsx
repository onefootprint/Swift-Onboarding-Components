import type { Actor, ListEventDetailCreateListEntry } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import Pill from '../pill';
import PrincipalActor from '../principal-actor';

type ListEntryCreatedEventHeaderProps = {
  principal?: Actor;
  event: ListEventDetailCreateListEntry;
};

const ListEntryCreatedEventHeader = ({ principal, event }: ListEntryCreatedEventHeaderProps) => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.activity-log.create-list-entry',
  });

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-h-[32px]">
      {principal && <PrincipalActor principal={principal} />}
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
