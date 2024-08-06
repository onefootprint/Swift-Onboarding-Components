import { getErrorMessage } from '@onefootprint/request';
import type { RiskSignal } from '@onefootprint/types';
import type { TableRow } from '@onefootprint/ui';
import { Table } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useCurrentEntityRiskSignals from '@/entity/hooks/use-current-entity-risk-signals';
import useEntitySeqno from '@/entity/hooks/use-entity-seqno';
import useRiskSignalsFilters from '@/entity/hooks/use-risk-signals-filters';

import Details from './components/details';
import Filters from './components/filters';
import Row from './components/row';

const RiskSignalsList = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.risk-signals.table',
  });
  const isViewingHistorical = !!useEntitySeqno();
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
    <Container data-primary-background={isViewingHistorical}>
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
    </Container>
  );
};

const renderTr = ({ item }: TableRow<RiskSignal>) => <Row riskSignal={item} />;

const Container = styled.div`
  ${({ theme }) => css`
    &[data-primary-background='true'] {
      > table,
      > table th {
        background-color: ${theme.backgroundColor.primary};
      }
    }
  `};
`;

export default RiskSignalsList;
