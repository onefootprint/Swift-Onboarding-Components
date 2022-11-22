import { RiskSignal } from '../data/risk-signal';

export type GetRiskSignalDetailsRequest = {
  userId: string;
  riskSignalId: string;
  authHeaders: {
    'x-fp-dashboard-authorization': string;
    'x-is-live': string;
  };
};

export type GetRiskSignalDetailsResponse = RiskSignal;
