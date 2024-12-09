import useRiskSignalsFilters from '@/entities/components/details/hooks/use-risk-signals-filters';
import type { RiskSignal } from '@onefootprint/request-types/dashboard';
import { Divider, Stack, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';
import isSentilinkSignal from '../../../../../../../risk-signals/utils/is-sentilink-signal';
import useRiskSignalSeverityText from '../../../../hooks/use-risk-signal-severity-text';

type RiskSignalItemProps = {
  riskSignal: RiskSignal;
};

const RiskSignalItem = ({ riskSignal }: RiskSignalItemProps) => {
  const riskSignalSeverityT = useRiskSignalSeverityText();
  const filters = useRiskSignalsFilters();
  const { id, reasonCode, severity } = riskSignal;

  // This will open StandardDetails or SentilinkDetails
  // TODO: move both components and isSentilinkSignal here after RiskSignalsList is removed
  const handleRowClick = () => {
    if (isSentilinkSignal(riskSignal)) {
      filters.push({ risk_signal_id: id, is_sentilink: 'true' });
    } else {
      filters.push({ risk_signal_id: id });
    }
  };

  const getSeverityColor = () => {
    if (severity === 'high') return 'error';
    if (severity === 'medium') return 'warning';
    if (severity === 'low') return 'info';
    if (severity === 'info') return 'neutral';
  };

  return (
    <Container gap={3} align="flex-end" paddingTop={2} paddingBottom={2} cursor="pointer" onClick={handleRowClick}>
      <Text variant="snippet-1" color="secondary">
        {reasonCode}
      </Text>
      <Divider variant="secondary" marginBottom={2} />
      <Text variant="caption-1" color={getSeverityColor()} marginBottom={1}>
        {riskSignalSeverityT(severity)}
      </Text>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
  &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }
  `};
`;

export default RiskSignalItem;
