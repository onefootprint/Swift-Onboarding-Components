import type { RiskSignal } from '../data/risk-signal';

export type GetRiskSignalDetailsRequest = {
  entityId: string;
  riskSignalId: string;
  authHeaders: {
    'x-fp-dashboard-authorization': string;
    'x-is-live': string;
  };
};

export type GetRiskSignalDetailsResponse = RiskSignal;
