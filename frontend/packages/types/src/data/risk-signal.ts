import { SignalAttribute } from './signal-attribute';

export enum RiskSignalSeverity {
  Info = 'Info',
  Warning = 'Warning',
  Fraud = 'Fraud',
}

export type RiskSignal = {
  deactivated_at: Date | null;
  id: string;
  note: string;
  onboardingDecisionId: string;
  reasonCode: string;
  scopes: SignalAttribute[];
  severity: RiskSignalSeverity;
  timestamp: Date;
  vendors: string[];
  related: RiskSignal[];
};
