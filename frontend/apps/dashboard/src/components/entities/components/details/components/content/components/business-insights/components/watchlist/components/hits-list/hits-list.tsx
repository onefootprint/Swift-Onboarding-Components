import type { WatchlistHit } from '@onefootprint/types';
import { Table, type TableRow } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Row from '../row';

type HitsListProps = {
  entity: string | undefined;
  hits: WatchlistHit[];
};

const HitsList = ({ entity, hits }: HitsListProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'business-insights.watchlist.table',
  });

  const columns = [
    { text: t('header.hits'), width: '25%' },
    { text: t('header.agency'), width: '25%' },
    { text: t('header.list'), width: '25%' },
    { text: t('header.country'), width: '25%' },
  ];

  return (
    <Table<WatchlistHit>
      aria-label={t('aria-label')}
      columns={columns}
      emptyStateText={entity ? t('empty-state', { entity }) : t('empty-state-no-entity')}
      getKeyForRow={(hit: WatchlistHit) => `${hit.entityName} ${hit.listName}`}
      items={hits}
      renderTr={renderTr}
    />
  );
};

const renderTr = ({ item }: TableRow<WatchlistHit>) => <Row hit={item} />;

export default HitsList;
