import type { RiskSignal } from '@onefootprint/request-types/dashboard';
import { Divider, Stack, Text } from '@onefootprint/ui';
import useRiskSignalSeverityText from '../../../../hooks/use-risk-signal-severity-text';

type RiskSignalItemProps = {
  riskSignal: RiskSignal;
};

const RiskSignalItem = ({ riskSignal }: RiskSignalItemProps) => {
  const riskSignalSeverityT = useRiskSignalSeverityText();
  const { reasonCode, severity } = riskSignal;

  const getSeverityColor = () => {
    if (severity === 'high') return 'error';
    if (severity === 'medium') return 'warning';
    if (severity === 'low') return 'info';
    if (severity === 'info') return 'neutral';
  };

  return (
    <Stack gap={3} align="flex-end" paddingTop={2} paddingBottom={2}>
      <Text variant="snippet-1" color="secondary">
        {reasonCode}
      </Text>
      <Divider variant="secondary" />
      <Text variant="caption-1" color={getSeverityColor()}>
        {riskSignalSeverityT(severity)}
      </Text>
    </Stack>
  );
};

export default RiskSignalItem;
