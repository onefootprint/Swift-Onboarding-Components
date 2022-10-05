import { useTranslation } from '@onefootprint/hooks';
import type { RiskSignal, RiskSignalDetails } from '@onefootprint/types';
import { Table, TableRow, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import useFilters from '../../../../../../hooks/use-signals-filters';
import Row from './components/row';

type RelatedSignalsProps = {
  relatedSignals: RiskSignalDetails['relatedSignals'];
};

const renderTr = ({ item }: TableRow<RiskSignal>) => <Row riskSignal={item} />;

const RelatedSignals = ({ relatedSignals }: RelatedSignalsProps) => {
  const filters = useFilters();
  const { t } = useTranslation(
    'pages.user-details.signals.details.related-signals',
  );
  const columns = [
    { id: 'severity', text: '', width: '20%' },
    { id: 'note', text: '', width: '65%' },
    { id: 'actions', text: '', width: '15%' },
  ];

  const handleClick = (relatedRiskSignal: RiskSignal) => {
    filters.push({
      signal_id: relatedRiskSignal.id,
      signal_note: relatedRiskSignal.note,
    });
  };

  return (
    <section>
      <Header>
        <Typography variant="label-2">{t('title')}</Typography>
      </Header>
      <Table<RiskSignal>
        aria-label={t('table.aria-label')}
        columns={columns}
        getKeyForRow={(riskSignal: RiskSignal) => riskSignal.id}
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
    margin-bottom: ${theme.spacing[5]}px;
  `}
`;

export default RelatedSignals;
