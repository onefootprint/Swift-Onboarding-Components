import { type RiskSignal, RiskSignalSeverity } from '@onefootprint/types';

export type RiskSignalSeverityGrouping = {
  [RiskSignalSeverity.Low]: RiskSignal[];
  [RiskSignalSeverity.Medium]: RiskSignal[];
  [RiskSignalSeverity.High]: RiskSignal[];
};

export type RiskSignalsSummary = {
  basic: RiskSignalSeverityGrouping;
  identity: RiskSignalSeverityGrouping;
  address: RiskSignalSeverityGrouping;
  document: RiskSignalSeverityGrouping;
};
