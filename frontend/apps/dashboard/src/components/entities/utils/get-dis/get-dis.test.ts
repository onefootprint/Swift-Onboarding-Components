import type { DataIdentifier } from '@onefootprint/types';

import { getBankDis, getCardDis, getDI } from './get-dis';

describe('getDis', () => {
  describe('getCardDis', () => {
    it('should filter, sort attributes and return in correct order for cards', () => {
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

      const result = getCardDis(input, 'primary');
      const expected: DataIdentifier[] = [
        'card.primary.issuer',
        'card.primary.name',
        'card.primary.number',
        'card.primary.expiration',
        'card.primary.cvc',
      ];

      expect(result).toEqual(expected);
    });

    it('should return the same order if input is already sorted and filtered for cards', () => {
      const input: DataIdentifier[] = [
        'card.primary.issuer',
        'card.primary.name',
        'card.primary.number',
        'card.primary.expiration',
        'card.primary.cvc',
      ];

      const result = getCardDis(input, 'primary');
      const expected: DataIdentifier[] = [...input];

      expect(result).toEqual(expected);
    });

    it('should sort by subkey if primary key is the same for cards', () => {
      const input: DataIdentifier[] = ['card.primary.billing_address.zip', 'card.primary.billing_address.country'];

      const result = getCardDis(input, 'primary');
      const expected: DataIdentifier[] = ['card.primary.billing_address.country', 'card.primary.billing_address.zip'];

      expect(result).toEqual(expected);
    });

    it('should default to card case when no type parameter is provided', () => {
      const input: DataIdentifier[] = [
        'card.primary.name',
        'card.primary.issuer',
        'card.primary.number',
        'card.primary.expiration',
        'card.primary.cvc',
        'card.primary.expiration_month',
        'card.primary.expiration_year',
        'card.primary.number_last4',
      ];

      const result = getCardDis(input, 'primary');
      const expected: DataIdentifier[] = [
        'card.primary.issuer',
        'card.primary.name',
        'card.primary.number',
        'card.primary.expiration',
        'card.primary.cvc',
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('getBankDis', () => {
    it('should filter and sort attributes for bank accounts', () => {
      const input: DataIdentifier[] = [
        'bank.account1.ach_routing_number',
        'bank.account1.name',
        'bank.account1.ach_account_number',
        'bank.account1.account_type',
      ];

      const result = getBankDis(input, 'account1');
      const expected: DataIdentifier[] = [
        'bank.account1.name',
        'bank.account1.account_type',
        'bank.account1.ach_account_number',
        'bank.account1.ach_routing_number',
      ];

      expect(result).toEqual(expected);
    });

    it('should handle bank accounts with no matching search term', () => {
      const input: DataIdentifier[] = [
        'bank.account1.name',
        'bank.account1.ach_account_number',
        'bank.account2.name',
        'bank.account2.ach_account_number',
      ];

      const result = getBankDis(input, 'account3');
      expect(result).toEqual([]);
    });
  });

  it('should handle empty input', () => {
    const input: DataIdentifier[] = [];
    const result = getCardDis(input, 'primary');
    expect(result).toEqual([]);
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
