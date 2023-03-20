import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type { RiskSignal } from '@onefootprint/types';
import { Table, TableRow } from '@onefootprint/ui';
import React from 'react';

import Header from '../header';
import Details from './components/details';
import Filters from './components/filters';
import Row from './components/row';
import useRiskSignals from './hooks/use-risk-signals';
import useRiskSignalsFilters from './hooks/use-risk-signals-filters';

const renderTr = ({ item }: TableRow<RiskSignal>) => <Row riskSignal={item} />;

const RiskSignals = () => {
  const { t } = useTranslation('pages.user-details.risk-signals');
  const { isLoading, error, data } = useRiskSignals();
  const filters = useRiskSignalsFilters();
  const columns = [
    { text: t('table.header.severity'), width: '15%' },
    { text: t('table.header.scopes'), width: '42.5%' },
    { text: t('table.header.note'), width: '42.5%' },
  ];

  const handleRowClick = (riskSignal: RiskSignal) => {
    filters.push({ risk_signal_id: riskSignal.id });
  };

  const handleSearchChange = (search: string) => {
    filters.push({ risk_signal_description: search });
  };

  return (
    <section>
      <Header title={t('title')} />
      <Table<RiskSignal>
        aria-label={t('table.aria-label')}
        columns={columns}
        emptyStateText={error ? getErrorMessage(error) : t('table.empty-state')}
        getKeyForRow={(signal: RiskSignal) => signal.id}
        isLoading={isLoading}
        items={data}
        onChangeSearchText={handleSearchChange}
        onRowClick={handleRowClick}
        renderActions={() => <Filters />}
        renderTr={renderTr}
        initialSearch={filters.query.risk_signal_description}
      />
      <Details />
    </section>
  );
};

export default RiskSignals;
