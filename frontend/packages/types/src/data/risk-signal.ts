import { SignalAttribute } from './signal-attribute';

export enum RiskSignalSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export type RiskSignal = {
  deactivated_at: Date | null;
  description: string;
  id: string;
  onboardingDecisionId: string;
  reasonCode: string;
  scopes: SignalAttribute[];
  severity: RiskSignalSeverity;
  timestamp: string;
  vendors: string[];
};
