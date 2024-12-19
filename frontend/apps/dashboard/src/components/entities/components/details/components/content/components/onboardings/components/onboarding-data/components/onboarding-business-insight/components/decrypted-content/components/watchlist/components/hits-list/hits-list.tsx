import { Table, type TableRow } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import type { FormattedWatchlistHit } from '../../../../../../onboarding-business-insight.types';
import Row from '../row';

type HitsListProps = {
  entity: string | undefined;
  hits: FormattedWatchlistHit[];
};

const HitsList = ({ entity, hits }: HitsListProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.watchlist.table' });

  const columns = [
    { text: t('header.hits'), width: '25%' },
    { text: t('header.agency'), width: '25%' },
    { text: t('header.list'), width: '25%' },
    { text: t('header.country'), width: '25%' },
  ];

  const renderTr = ({ item }: TableRow<FormattedWatchlistHit>) => <Row hit={item} />;

  return (
    <Table<FormattedWatchlistHit>
      aria-label={t('aria-label')}
      columns={columns}
      emptyStateText={entity ? t('empty-state', { entity }) : t('empty-state-no-entity')}
      getKeyForRow={(hit: FormattedWatchlistHit) => `${hit.entityName} ${hit.listName}`}
      items={hits}
      renderTr={renderTr}
    />
  );
};

export default HitsList;
