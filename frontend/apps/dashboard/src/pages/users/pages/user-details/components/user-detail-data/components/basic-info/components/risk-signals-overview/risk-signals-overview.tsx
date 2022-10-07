import { useTranslation } from '@onefootprint/hooks';
import { RiskSignal } from '@onefootprint/types';
import { LinkButton } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import RiskSignalsCount from './components/risk-signals-count';
import RiskSignalsOverviewDialog from './components/risk-signals-overview-dialog';

export type RiskSignalsOverviewProps = {
  high?: RiskSignal[];
  medium?: RiskSignal[];
  low?: RiskSignal[];
};

const RiskSignalsOverview = ({
  high = [],
  medium = [],
  low = [],
}: RiskSignalsOverviewProps) => {
  const { t } = useTranslation('pages.user-details.user-info.risks');
  const hasAnyRisk = high.length > 0 || medium.length > 0 || low.length > 0;

  return (
    <RisksOverviewContainer>
      <RiskSignalsCount high={high} medium={medium} low={low} />
      {hasAnyRisk && (
        <RiskSignalsOverviewDialog
          riskSignals={[...high, ...medium, ...low]}
          renderCta={({ onClick }) => (
            <LinkButton size="compact" onClick={onClick}>
              {t('cta')}
            </LinkButton>
          )}
        />
      )}
    </RisksOverviewContainer>
  );
};

const RisksOverviewContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export default RiskSignalsOverview;
