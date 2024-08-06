import type { RiskSignal } from '@onefootprint/types';
import { LinkButton } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Count from './components/count';
import ListDialog from './components/list-dialog';

export type ContentProps = {
  high: RiskSignal[];
  medium: RiskSignal[];
  low: RiskSignal[];
};

const Content = ({ high, medium, low }: ContentProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.risks' });
  const hasAnyRisk = high.length > 0 || medium.length > 0 || low.length > 0;

  return (
    <DataContainer>
      <Count high={high} medium={medium} low={low} />
      {hasAnyRisk && (
        <ListDialog
          riskSignals={[...high, ...medium, ...low]}
          renderCta={({ onClick }) => <LinkButton onClick={onClick}>{t('cta')}</LinkButton>}
        />
      )}
    </DataContainer>
  );
};

const DataContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export default Content;
