import type { RiskSignal } from '../data';

export type GetEntityRiskSignalsRequest = {
  id: string;
  scope?: string;
  description?: string;
  severity?: string;
};

export type GetEntityRiskSignalsResponse = RiskSignal[];
