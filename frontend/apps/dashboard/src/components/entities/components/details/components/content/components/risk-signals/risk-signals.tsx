import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type { RiskSignal } from '@onefootprint/types';
import type { TableRow } from '@onefootprint/ui';
import { Table } from '@onefootprint/ui';
import React from 'react';

import useCurrentEntityRiskSignals from '@/entity/hooks/use-current-entity-risk-signals';
import useRiskSignalsFilters from '@/entity/hooks/use-risk-signals-filters';

import Section from '../section';
import Details from './components/details';
import Filters from './components/filters';
import Row from './components/row';

const RiskSignals = () => {
  const { t } = useTranslation('pages.entity.risk-signals');
  const { isLoading, error, data } = useCurrentEntityRiskSignals();
  const filters = useRiskSignalsFilters();
  const columns = [
    { text: t('table.header.severity'), width: '15%' },
    { text: t('table.header.scopes'), width: '30%' },
    { text: t('table.header.reason-code'), width: '55%' },
  ];

  const handleRowClick = (riskSignal: RiskSignal) => {
    filters.push({ risk_signal_id: riskSignal.id });
  };

  const handleSearchChange = (search: string) => {
    filters.push({ risk_signal_description: search });
  };

  return (
    <Section title={t('title')}>
      <Table<RiskSignal>
        aria-label={t('table.aria-label')}
        columns={columns}
        emptyStateText={error ? getErrorMessage(error) : t('table.empty-state')}
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
    </Section>
  );
};

const renderTr = ({ item }: TableRow<RiskSignal>) => <Row riskSignal={item} />;

export default RiskSignals;
