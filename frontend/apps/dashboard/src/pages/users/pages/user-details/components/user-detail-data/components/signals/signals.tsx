import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type { RiskSignal } from '@onefootprint/types';
import { Button, Table, TableRow, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import SignalDetails from './components/signal-details';
import SignalFilters from './components/signal-filters';
import SignalRow from './components/signal-row';
import useRiskSignals from './hooks/use-signals';
import useSignalsFilters from './hooks/use-signals-filters';

const renderTr = ({ item }: TableRow<RiskSignal>) => (
  <SignalRow signal={item} />
);

const RiskSignals = () => {
  const { t, allT } = useTranslation('pages.user-details.signals');
  const { isLoading, error, data } = useRiskSignals();
  const filters = useSignalsFilters();
  const columns = [
    { text: t('table.header.severity'), width: '15%' },
    { text: t('table.header.scopes'), width: '15%' },
    { text: t('table.header.description'), width: '70%' },
  ];

  const handleRowClick = (riskSignal: RiskSignal) => {
    filters.push({ signal_id: riskSignal.id });
  };

  return (
    <section>
      <Header>
        <Typography as="h2" variant="label-1">
          {t('title')}
        </Typography>
      </Header>
      <Table<RiskSignal>
        aria-label={t('table.aria-label')}
        columns={columns}
        emptyStateText={error ? getErrorMessage(error) : t('table.empty-state')}
        getKeyForRow={(signal: RiskSignal) => signal.id}
        isLoading={isLoading}
        items={data}
        onChangeSearchText={search => {
          filters.push({ signal_search: search });
        }}
        onRowClick={handleRowClick}
        renderActions={() => (
          <SignalFilters
            renderCta={({ onClick, filtersCount }) => (
              <Button size="small" variant="secondary" onClick={onClick}>
                {allT('filters.cta', { count: filtersCount })}
              </Button>
            )}
          />
        )}
        renderTr={renderTr}
        search={filters.query.signal_search}
      />
      <SignalDetails />
    </section>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]}px;
  `}
`;

export default RiskSignals;
