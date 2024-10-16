import sortReasonCodes from './sort-reason-codes';
import { outOfOrderReasonCodes, singleReasonCode, sortedReasonCodes } from './sort-reason-codes.test.config';

describe('sortReasonCodes', () => {
  it('should return an empty array when given an empty array', () => {
    const result = sortReasonCodes([]);
    expect(result).toEqual([]);
  });

  it('should return the same array when given a single reason code', () => {
    const result = sortReasonCodes(singleReasonCode);
    expect(result).toEqual(singleReasonCode);
  });

  it('should correctly sort an array of reason codes that are already in order', () => {
    const result = sortReasonCodes(sortedReasonCodes);
    expect(result).toEqual(sortedReasonCodes);
  });

  it('should correctly sort an array of reason codes that are out of order', () => {
    const result = sortReasonCodes(outOfOrderReasonCodes);
    expect(result).toEqual(sortedReasonCodes);
  });
});
