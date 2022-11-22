import { RiskSignal } from '../data';

export type GetRiskSignalsRequest = {
  userId: string;
  authHeaders: {
    'x-fp-dashboard-authorization': string;
    'x-is-live': string;
  };
  params: Record<string, string | undefined>;
};

export type GetRiskSignalsResponse = RiskSignal[];
