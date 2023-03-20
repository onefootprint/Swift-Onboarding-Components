import { useTranslation } from '@onefootprint/hooks';
import type { RiskSignal } from '@onefootprint/types';
import { Table, TableRow, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import useRiskSignalsFilters from '../../../../../../hooks/use-risk-signals-filters';
import Row from './components/related-signal-row';

type RelatedSignalsProps = {
  relatedSignals: RiskSignal[];
};

const renderTr = ({ item }: TableRow<RiskSignal>) => <Row riskSignal={item} />;

const RelatedSignals = ({ relatedSignals }: RelatedSignalsProps) => {
  const filters = useRiskSignalsFilters();
  const { t } = useTranslation(
    'pages.user-details.risk-signals.details.signals',
  );
  const columns = [
    { id: 'severity', text: '', width: '20%' },
    { id: 'note', text: '', width: '65%' },
    { id: 'actions', text: '', width: '15%' },
  ];

  const handleClick = (relatedSignal: RiskSignal) => {
    filters.push({ risk_signal_id: relatedSignal.id });
  };

  return (
    <section>
      <Header>
        <Typography variant="label-2">{t('title')}</Typography>
      </Header>
      <Table<RiskSignal>
        aria-label={t('table.aria-label')}
        columns={columns}
        getKeyForRow={(signal: RiskSignal) => signal.id}
        hideThead
        items={relatedSignals}
        onRowClick={handleClick}
        renderTr={renderTr}
      />
    </section>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[5]};
  `}
`;

export default RelatedSignals;
