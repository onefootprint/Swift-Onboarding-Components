import type { RiskSignalAttribute } from './risk-signal-attribute';

export enum RiskSignalSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Info = 'info',
}

export type RiskSignal = {
  description: string;
  id: string;
  note: string;
  onboardingDecisionId: string;
  reasonCode: string;
  scopes: RiskSignalAttribute[];
  severity: RiskSignalSeverity;
  timestamp: string;
  hasAmlHits: boolean;
};
