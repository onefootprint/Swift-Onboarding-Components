import { STATES } from '@onefootprint/global-constants';
import type { SOSFiling } from '@onefootprint/types';
import { Stack, Table, type TableRow } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import DrawerFilter from './components/drawer-filter';
import Row from './components/row';
import useSOSFilingsFilters from './hooks/use-sos-filings-filters';

type SOSFilingsProps = {
  data: SOSFiling[];
  onOpen: (id: string) => void;
};

const SOSFilings = ({ data, onOpen }: SOSFilingsProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'business-insights.sos-filings.table',
  });
  const filters = useSOSFilingsFilters();
  const stateFilterOptions = [
    ...new Set(data.map(({ state }) => state).filter(state => !!STATES.find(s => s.label === state))),
  ];
  const columns = [
    { text: t('header.state'), width: '33%' },
    { text: t('header.file-date'), width: '33%' },
    { text: t('header.status'), width: '33%' },
  ];

  const filteredData = () => {
    return filters.values.states.length
      ? data.filter(({ state }) => state && filters.values.states.includes(state))
      : data;
  };

  const renderTr = ({ item }: TableRow<SOSFiling>) => {
    return <Row filing={item} />;
  };

  return (
    <Stack direction="column" gap={4}>
      {filters.isReady && <DrawerFilter states={stateFilterOptions} />}
      <Table<SOSFiling>
        aria-label={t('aria-label')}
        columns={columns}
        emptyStateText={t('empty-state')}
        getKeyForRow={(filing: SOSFiling) => filing.id}
        items={filteredData()}
        onRowClick={(filing: SOSFiling) => onOpen(filing.id)}
        renderTr={renderTr}
      />
    </Stack>
  );
};

export default SOSFilings;
