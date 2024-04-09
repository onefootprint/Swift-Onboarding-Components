import { getErrorMessage } from '@onefootprint/request';
import type { RiskSignal } from '@onefootprint/types';
import type { TableRow } from '@onefootprint/ui';
import { Table } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useCurrentEntityRiskSignals from '@/entity/hooks/use-current-entity-risk-signals';
import useRiskSignalsFilters from '@/entity/hooks/use-risk-signals-filters';

import Details from './components/details';
import Filters from './components/filters';
import Row from './components/row';

const RiskSignalsList = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.risk-signals.table',
  });
  const { isLoading, error, data } = useCurrentEntityRiskSignals();
  const filters = useRiskSignalsFilters();
  const columns = [
    { text: t('header.severity'), width: '15%' },
    { text: t('header.scopes'), width: '30%' },
    { text: t('header.reason-code'), width: '55%' },
  ];

  const handleRowClick = (riskSignal: RiskSignal) => {
    filters.push({ risk_signal_id: riskSignal.id });
  };

  const handleSearchChange = (search: string) => {
    filters.push({ risk_signal_description: search });
  };

  return (
    <>
      <Table<RiskSignal>
        aria-label={t('aria-label')}
        columns={columns}
        emptyStateText={error ? getErrorMessage(error) : t('empty-state')}
        getKeyForRow={(signal: RiskSignal) => signal.id}
        initialSearch={filters.query.risk_signal_description}
        isLoading={isLoading}
        items={data}
        onChangeSearchText={handleSearchChange}
        onRowClick={handleRowClick}
        renderActions={() => <Filters />}
        renderTr={renderTr}
      />
      <Details />
    </>
  );
};

const renderTr = ({ item }: TableRow<RiskSignal>) => <Row riskSignal={item} />;

export default RiskSignalsList;
