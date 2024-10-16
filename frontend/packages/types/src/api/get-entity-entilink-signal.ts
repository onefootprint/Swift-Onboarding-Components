export type GetEntitySentilinkSignalRequest = {
  entityId: string;
  riskSignalId: string;
};

type SentilinkReasonCode = {
  code: string;
  direction: string;
  explanation: string;
  rank: number;
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
