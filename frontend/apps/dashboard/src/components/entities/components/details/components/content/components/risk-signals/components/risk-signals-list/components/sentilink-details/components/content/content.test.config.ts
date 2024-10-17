import { type GetEntitySentilinkSignalResponse, SentilinkFraudLevel, SentilinkScoreBand } from '@onefootprint/types';

export const sentilinkSignalFixture: GetEntitySentilinkSignalResponse = {
  idTheft: {
    scoreBand: SentilinkScoreBand.high,
    reasonCodes: [
      {
        code: 'ID001',
        direction: SentilinkFraudLevel.moreFraudy,
        explanation: 'Suspicious activity detected',
        rank: 1,
      },
    ],
    score: 75,
  },
  synthetic: {
    scoreBand: SentilinkScoreBand.high,
    reasonCodes: [
      {
        code: 'SY001',
        direction: SentilinkFraudLevel.lessFraudy,
        explanation: 'No suspicious patterns found',
        rank: 1,
      },
    ],
    score: 25,
  },
};
