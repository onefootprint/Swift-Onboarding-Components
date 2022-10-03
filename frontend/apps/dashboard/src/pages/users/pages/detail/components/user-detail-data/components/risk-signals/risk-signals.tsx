import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type { RiskSignal } from '@onefootprint/types';
import { Table, TableRow, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import Row from './components/row';
import useRiskSignals from './hooks/use-risk-signals';

const renderTr = ({ item }: TableRow<RiskSignal>) => <Row riskSignal={item} />;

const RiskSignals = () => {
  const { isLoading, error, data: response } = useRiskSignals();
  const { t } = useTranslation('pages.user-details.risk-signals');
  const columns = [
    { text: t('table.header.severity'), width: '15%' },
    { text: t('table.header.scope'), width: '15%' },
    { text: t('table.header.note'), width: '70%' },
  ];

  const handleRowClick = (riskSignal: RiskSignal) => {
    console.log(riskSignal.id);
  };

  return (
    <section>
      <Header>
        <Typography as="h2" variant="label-1">
          {t('title')}
        </Typography>
      </Header>
      <Table<RiskSignal>
        onRowClick={handleRowClick}
        aria-label={t('table.aria-label')}
        columns={columns}
        emptyStateText={error ? getErrorMessage(error) : t('table.empty-state')}
        getKeyForRow={(riskSignal: RiskSignal) => riskSignal.id}
        isLoading={isLoading}
        items={response?.data}
        renderTr={renderTr}
      />
    </section>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]}px;
  `}
`;

export default RiskSignals;
