import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type { RiskSignal } from '@onefootprint/types';
import { Button, Table, TableRow, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import Details from './components/details';
import Filters from './components/filters';
import Row from './components/row';
import useRiskSignals from './hooks/use-risk-signals';
import useRiskSignalsFilters from './hooks/use-risk-signals-filters';

const renderTr = ({ item }: TableRow<RiskSignal>) => <Row signal={item} />;

const RiskSignals = () => {
  const { t, allT } = useTranslation('pages.user-details.risk-signals');
  const { isLoading, error, data } = useRiskSignals();
  const filters = useRiskSignalsFilters();
  const columns = [
    { text: t('table.header.severity'), width: '15%' },
    { text: t('table.header.scopes'), width: '15%' },
    { text: t('table.header.description'), width: '70%' },
  ];

  const handleRowClick = (riskSignal: RiskSignal) => {
    filters.push({ signal_id: riskSignal.id });
  };

  const handleSearchChange = (search: string) => {
    filters.push({ signal_description: search });
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
        onChangeSearchText={handleSearchChange}
        onRowClick={handleRowClick}
        renderActions={() => (
          <Filters
            renderCta={({ onClick, filtersCount }) => (
              <Button size="small" variant="secondary" onClick={onClick}>
                {allT('filters.cta', { count: filtersCount })}
              </Button>
            )}
          />
        )}
        renderTr={renderTr}
        initialSearch={filters.query.signal_description}
      />
      <Details />
    </section>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]};
  `}
`;

export default RiskSignals;
