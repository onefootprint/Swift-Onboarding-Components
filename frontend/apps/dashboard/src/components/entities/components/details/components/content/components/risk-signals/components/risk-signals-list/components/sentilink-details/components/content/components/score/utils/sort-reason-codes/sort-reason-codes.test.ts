import { sortReasonCodes } from './sort-reason-codes';
import {
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
