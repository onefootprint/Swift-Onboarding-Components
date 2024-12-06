import type { RiskSignal, RiskSignalGroupKind } from '@onefootprint/request-types/dashboard';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useRiskSignalGroupText from '../../hooks/use-risk-signal-group-text';
import RiskSignalItem from './components/risk-signal-item';

type OnboardingRiskSignalsProps = {
  riskSignals: Partial<Record<RiskSignalGroupKind, RiskSignal[]>>;
};

const OnboardingRiskSignals = ({ riskSignals }: OnboardingRiskSignalsProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.risk-signals' });
  const riskSignalGroupT = useRiskSignalGroupText();
  const hasRiskSignals = Object.keys(riskSignals).length > 0;

  return hasRiskSignals ? (
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
  ) : (
    <Text variant="body-3">{t('no-risk-signals')}</Text>
  );
};

export default OnboardingRiskSignals;
