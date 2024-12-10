import type { RiskSignal, RiskSignalGroupKind } from '@onefootprint/request-types/dashboard';
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
    <div className="flex flex-col gap-7">
      {Object.entries(riskSignals).map(([group, signals]) => (
        <div key={group} className="flex flex-col gap-2">
          <p className="text-label-3">
            {riskSignalGroupT(group as RiskSignalGroupKind)} ({signals.length})
          </p>
          <div className="flex flex-col gap-1">
            {signals.map(signal => (
              <RiskSignalItem riskSignal={signal} />
            ))}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-body-3">{t('no-risk-signals')}</p>
  );
};

export default OnboardingRiskSignals;
