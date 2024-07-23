import { STATES } from '@onefootprint/global-constants';
import { SOSFiling } from '@onefootprint/types';
import { Stack, Table, TableRow } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Details from './components/details';
import DrawerFilter from './components/drawer-filter';
import Row from './components/row';
import useSOSFilingsFilters from './hooks/use-sos-filings-filters';

type SOSFilingsProps = {
  data: SOSFiling[];
};

const SOSFilings = ({ data }: SOSFilingsProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights.sos-filings.table',
  });
  const [openFilingId, setOpenFilingId] = useState<string | undefined>(undefined);
  const filters = useSOSFilingsFilters();
  const stateFilterOptions = [
    ...new Set(data.map(({ state }) => state).filter(state => !!STATES.find(s => s.label === state))),
  ];
  const columns = [
    { text: t('header.state'), width: '33%' },
    { text: t('header.file-date'), width: '33%' },
    { text: t('header.status'), width: '33%' },
  ];

  const handleOpen = (filing: SOSFiling) => {
    setOpenFilingId(filing.id);
  };

  const handleClose = () => {
    setOpenFilingId(undefined);
  };

  const filteredData = () => {
    return filters.values.states.length
      ? data.filter(({ state }) => state && filters.values.states.includes(state))
      : data;
  };

  const renderTr = ({ item }: TableRow<SOSFiling>) => {
    const isOpen = item.id === openFilingId;
    return (
      <>
        <Row filing={item} />
        {isOpen && <Details filing={item} open={isOpen} onClose={handleClose} />}
      </>
    );
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
        onRowClick={handleOpen}
        renderTr={renderTr}
      />
    </Stack>
  );
};

export default SOSFilings;
