import type { AmlDetail } from '../data';

export type DecryptRiskSignalAmlHitsRequest = {
  entityId: string;
  riskSignalId: string;
  authHeaders: {
    'x-fp-dashboard-authorization': string;
    'x-is-live': string;
  };
};

export type DecryptRiskSignalAmlHitsResponse = AmlDetail;
