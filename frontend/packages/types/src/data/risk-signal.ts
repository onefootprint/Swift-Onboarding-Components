import { SignalAttribute } from './signal-attribute';

export enum RiskSignalSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export type RiskSignal = {
  deactivatedAt: Date | null;
  description: string;
  id: string;
  note: string;
  onboardingDecisionId: string;
  reasonCode: string;
  scopes: SignalAttribute[];
  severity: RiskSignalSeverity;
  timestamp: string;
  vendors: string[];
};
