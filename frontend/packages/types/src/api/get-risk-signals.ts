import { RiskSignal } from '../data';

export type GetRiskSignalsRequest = {
  scope?: string;
  description?: string;
  severity?: string;
};

export type GetRiskSignalsResponse = RiskSignal[];
