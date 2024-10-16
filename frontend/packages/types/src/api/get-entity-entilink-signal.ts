import type { SentilinkReasonCode } from './../data/sentilink';

export type GetEntitySentilinkSignalRequest = {
  entityId: string;
  riskSignalId: string;
};

export type GetEntitySentilinkSignalResponse = {
  idTheft?: {
    reasonCodes: SentilinkReasonCode[];
    score: number;
  };
  synthetic?: {
    reasonCodes: SentilinkReasonCode[];
    score: number;
  };
};
