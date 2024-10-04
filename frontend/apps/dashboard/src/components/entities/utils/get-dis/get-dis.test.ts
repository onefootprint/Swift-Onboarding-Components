import type { DataIdentifier } from '@onefootprint/types';

import getDis, { getDI } from './get-dis';

describe('getDis', () => {
  it('should filter, sort attributes and return in correct order', () => {
    const input: DataIdentifier[] = [
      'card.primary.name',
      'card.primary.issuer',
      'card.primary.expiration',
      'card.primary.cvc',
      'card.primary.number',
      'card.primary.expiration_month',
      'card.primary.expiration_year',
      'card.primary.number_last4',
    ];

    const result = getDis(input, 'primary');
    const expected: DataIdentifier[] = [
      'card.primary.issuer',
      'card.primary.name',
      'card.primary.number',
      'card.primary.expiration',
      'card.primary.cvc',
    ];

    expect(result).toEqual(expected);
  });

  it('should return the same order if input is already sorted and filtered', () => {
    const input: DataIdentifier[] = [
      'card.primary.issuer',
      'card.primary.name',
      'card.primary.number',
      'card.primary.expiration',
      'card.primary.cvc',
    ];

    const result = getDis(input, 'primary');
    const expected: DataIdentifier[] = [...input];

    expect(result).toEqual(expected);
  });

  it('should handle empty input', () => {
    const input: DataIdentifier[] = [];
    const result = getDis(input, 'primary');
    expect(result).toEqual([]);
  });

  it('should sort by subkey if primary key is the same', () => {
    const input: DataIdentifier[] = ['card.primary.billing_address.zip', 'card.primary.billing_address.country'];

    const result = getDis(input, 'primary');
    const expected: DataIdentifier[] = ['card.primary.billing_address.country', 'card.primary.billing_address.zip'];

    expect(result).toEqual(expected);
  });
});

describe('getDI', () => {
  it('should return verbose di for card attributes', () => {
    const input = 'card.primary.name';
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
