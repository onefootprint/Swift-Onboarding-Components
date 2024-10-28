import { type RiskSignal, RiskSignalSeverity } from './risk-signal';

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
