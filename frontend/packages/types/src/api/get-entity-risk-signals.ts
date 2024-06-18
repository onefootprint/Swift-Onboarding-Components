import type { RiskSignal } from '../data';

export type GetEntityRiskSignalsRequest = {
  id: string;
  scope?: string;
  description?: string;
  severity?: string;
  seqno?: string | undefined;
};

export type GetEntityRiskSignalsResponse = RiskSignal[];
