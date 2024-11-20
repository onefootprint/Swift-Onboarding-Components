import type { RiskSignal, RiskSignalGroupKind, SignalSeverity } from '@onefootprint/request-types/dashboard';

// Groups risk signals by group and sorts them within each group by severity
const groupRiskSignals = (riskSignals: RiskSignal[]): Record<RiskSignalGroupKind, RiskSignal[]> => {
  const severityOrder: Record<SignalSeverity, number> = {
    high: 0,
    medium: 1,
    low: 2,
    info: 3,
  };
  const result: Partial<Record<RiskSignalGroupKind, RiskSignal[]>> = {};

  riskSignals.forEach(signal => {
    if (!result[signal.group]) {
      result[signal.group] = [];
    }
    result[signal.group]!.push(signal);
  });

  Object.values(result).forEach(groupSignals => {
    groupSignals.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  });

  return result as Record<RiskSignalGroupKind, RiskSignal[]>;
};

export default groupRiskSignals;
