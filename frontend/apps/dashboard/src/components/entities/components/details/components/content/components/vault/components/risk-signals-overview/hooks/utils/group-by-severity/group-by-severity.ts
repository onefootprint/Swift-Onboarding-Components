import type { RiskSignal } from '@onefootprint/types';
import { RiskSignalSeverity } from '@onefootprint/types';

const groupBySeverity = (risksSignals: RiskSignal[]) => {
  const severities: {
    [RiskSignalSeverity.Low]: RiskSignal[];
    [RiskSignalSeverity.Medium]: RiskSignal[];
    [RiskSignalSeverity.High]: RiskSignal[];
  } = {
    [RiskSignalSeverity.Low]: [],
    [RiskSignalSeverity.Medium]: [],
    [RiskSignalSeverity.High]: [],
  };
  risksSignals.forEach(riskSignal => {
    if (riskSignal.severity === RiskSignalSeverity.Low) {
      severities[RiskSignalSeverity.Low].push(riskSignal);
    } else if (riskSignal.severity === RiskSignalSeverity.Medium) {
      severities[RiskSignalSeverity.Medium].push(riskSignal);
    } else if (riskSignal.severity === RiskSignalSeverity.High) {
      severities[RiskSignalSeverity.High].push(riskSignal);
    }
  });
  return severities;
};

export default groupBySeverity;
