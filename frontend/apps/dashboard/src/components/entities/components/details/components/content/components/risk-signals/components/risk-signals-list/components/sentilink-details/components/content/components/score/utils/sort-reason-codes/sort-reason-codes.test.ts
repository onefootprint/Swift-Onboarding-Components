import { SentilinkFraudLevel } from '@onefootprint/types';
import { getLessFraudyReasonCodes, getMoreFraudyReasonCodes, sortReasonCodes } from './sort-reason-codes';
import {
  mixedReasonCodesFixture,
  outOfOrderReasonCodesFixture,
  singleReasonCodeFixture,
  sortedReasonCodesFixture,
} from './sort-reason-codes.test.config';

describe('sortReasonCodes', () => {
  it('should return an empty array when given an empty array', () => {
    const result = sortReasonCodes([]);
    expect(result).toEqual([]);
  });

  it('should return the same array when given a single reason code', () => {
    const result = sortReasonCodes(singleReasonCodeFixture);
    expect(result).toEqual(singleReasonCodeFixture);
  });

  it('should correctly sort an array of reason codes that are already in order', () => {
    const result = sortReasonCodes(sortedReasonCodesFixture);
    expect(result).toEqual(sortedReasonCodesFixture);
  });

  it('should correctly sort an array of reason codes that are out of order', () => {
    const result = sortReasonCodes(outOfOrderReasonCodesFixture);
    expect(result).toEqual(sortedReasonCodesFixture);
  });
});

describe('getMoreFraudyReasonCodes', () => {
  it('should return an empty array when given an empty array', () => {
    const result = getMoreFraudyReasonCodes([]);
    expect(result).toEqual([]);
  });

  it('should return only the more fraudy reason codes sorted by rank', () => {
    const result = getMoreFraudyReasonCodes(mixedReasonCodesFixture);
    expect(result).toEqual([
      {
        code: 'code3',
        direction: SentilinkFraudLevel.moreFraudy,
        explanation: 'Explanation 3',
        rank: 1,
      },
      {
        code: 'code1',
        direction: SentilinkFraudLevel.moreFraudy,
        explanation: 'Explanation 1',
        rank: 3,
      },
    ]);
  });
});

describe('getLessFraudyReasonCodes', () => {
  it('should return an empty array when given an empty array', () => {
    const result = getLessFraudyReasonCodes([]);
    expect(result).toEqual([]);
  });

  it('should return only the less fraudy reason codes sorted by rank', () => {
    const result = getLessFraudyReasonCodes(mixedReasonCodesFixture);
    expect(result).toEqual([
      {
        code: 'code2',
        direction: SentilinkFraudLevel.lessFraudy,
        explanation: 'Explanation 2',
        rank: 2,
      },
      {
        code: 'code4',
        direction: SentilinkFraudLevel.lessFraudy,
        explanation: 'Explanation 4',
        rank: 4,
      },
      {
        code: 'code5',
        direction: SentilinkFraudLevel.lessFraudy,
        explanation: 'Explanation 5',
        rank: 5,
      },
    ]);
  });
});
