import type { DataIdentifier } from '@onefootprint/types';

import getDis, { getDI } from './get-dis';

describe('getDis', () => {
  it('should filter, sort attributes and return in correct order', () => {
    const input: DataIdentifier[] = [
      'card.flerp.name',
      'card.flerp.issuer',
      'card.flerp.expiration',
      'card.flerp.cvc',
      'card.flerp.number',
      'card.flerp.expiration_month',
      'card.flerp.expiration_year',
      'card.flerp.number_last4',
    ];

    const result = getDis(input, 'flerp');
    const expected: DataIdentifier[] = [
      'card.flerp.issuer',
      'card.flerp.name',
      'card.flerp.number',
      'card.flerp.expiration',
      'card.flerp.cvc',
    ];

    expect(result).toEqual(expected);
  });

  it('should return the same order if input is already sorted and filtered', () => {
    const input: DataIdentifier[] = [
      'card.flerp.issuer',
      'card.flerp.name',
      'card.flerp.number',
      'card.flerp.expiration',
      'card.flerp.cvc',
    ];

    const result = getDis(input, 'flerp');
    const expected: DataIdentifier[] = [...input];

    expect(result).toEqual(expected);
  });

  it('should handle empty input', () => {
    const input: DataIdentifier[] = [];
    const result = getDis(input, 'flerp');
    expect(result).toEqual([]);
  });
});

describe('getDI', () => {
  it('should return verbose di for card attributes', () => {
    const input = 'card.flerp.name';
    const result = getDI(input);
    const expected = 'di.card.verbose.name';
    expect(result).toEqual(expected);
  });

  it('should return custom di for custom attributes', () => {
    const input = 'custom.environment';
    const result = getDI(input);
    const expected = 'custom.environment';
    expect(result).toEqual(expected);
  });
});
