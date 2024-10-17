import type { SentilinkReasonCode, SentilinkScoreBand } from './../data';

export type GetEntitySentilinkSignalRequest = {
  entityId: string;
  riskSignalId: string;
};

export type GetEntitySentilinkSignalResponse = {
  idTheft?: {
    scoreBand: SentilinkScoreBand;

    reasonCodes: SentilinkReasonCode[];
    score: number;
  };
  synthetic?: {
    scoreBand: SentilinkScoreBand;
    reasonCodes: SentilinkReasonCode[];
    score: number;
  };
};
