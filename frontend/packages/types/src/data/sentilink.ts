export enum SentilinkFraudLevel {
  moreFraudy = 'more_fraudy',
  lessFraudy = 'less_fraudy',
}

export type SentilinkReasonCode = {
  code: string;
  direction: SentilinkFraudLevel;
  explanation: string;
  rank: number;
};
