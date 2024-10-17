export enum SentilinkFraudLevel {
  moreFraudy = 'more_fraudy',
  lessFraudy = 'less_fraudy',
}

export enum SentilinkScoreBand {
  high = 'high',
  medium = 'medium',
  low = 'low',
}

export type SentilinkReasonCode = {
  code: string;
  direction: SentilinkFraudLevel;
  explanation: string;
  rank: number;
};
