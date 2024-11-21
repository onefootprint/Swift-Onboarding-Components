import type { RiskSignal, RiskSignalGroupKind } from '@onefootprint/request-types/dashboard';
import { Stack, Text } from '@onefootprint/ui';
import useRiskSignalGroupText from '../../hooks/use-risk-signal-group-text';
import RiskSignalItem from './components/risk-signal-item';

type OnboardingRiskSignalsProps = {
  riskSignals: Partial<Record<RiskSignalGroupKind, RiskSignal[]>>;
};

const OnboardingRiskSignals = ({ riskSignals }: OnboardingRiskSignalsProps) => {
  const riskSignalGroupT = useRiskSignalGroupText();

  return (
    <Stack direction="column" gap={7}>
      {Object.entries(riskSignals).map(([group, signals]) => (
        <Stack direction="column" gap={3}>
          <Text variant="label-3">
            {riskSignalGroupT(group as RiskSignalGroupKind)} ({signals.length})
          </Text>
          {signals.map(signal => (
            <RiskSignalItem riskSignal={signal} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
};

export default OnboardingRiskSignals;
