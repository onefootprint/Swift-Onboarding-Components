import { SignalAttribute } from './signal-attribute';

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
  scopes: SignalAttribute[];
  severity: RiskSignalSeverity;
  timestamp: string;
};
