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
    <div className="flex flex-wrap items-center gap-1 min-h-8">
      {principal && <PrincipalActor principal={principal} />}
      <p className="inline-flex items-center h-8 text-body-3 text-tertiary">{t('verb')}</p>
      {event.data.entries.map(e => (
        <Pill className="h-8" key={e}>
          {e}
        </Pill>
      ))}
    </div>
  );
};

export default ListEntryCreatedEventHeader;
