import type { Attribute, DataIdentifier } from '@onefootprint/types';
import { DataKind } from '@onefootprint/types';

import { attributesToDIs, getBankDis, getCardDis, getDI } from './get-dis';

const defaultAttribute: Omit<Attribute, 'identifier'> = {
  source: 'test',
  isDecryptable: true,
  dataKind: DataKind.vaultData,
  value: '',
  transforms: {},
};

describe('getDis', () => {
  describe('getCardDis', () => {
    it('should filter, sort attributes and return in correct order for cards', () => {
      const input: Attribute[] = [
        { ...defaultAttribute, identifier: 'card.primary.name' },
        { ...defaultAttribute, identifier: 'card.primary.issuer' },
        { ...defaultAttribute, identifier: 'card.primary.expiration' },
        { ...defaultAttribute, identifier: 'card.primary.cvc' },
        { ...defaultAttribute, identifier: 'card.primary.number' },
        { ...defaultAttribute, identifier: 'card.primary.expiration_month' },
        { ...defaultAttribute, identifier: 'card.primary.expiration_year' },
        { ...defaultAttribute, identifier: 'card.primary.number_last4' },
        { ...defaultAttribute, identifier: 'card.primary.billing_address.zip' },
        { ...defaultAttribute, identifier: 'card.primary.billing_address.country' },
      ];

      const result = getCardDis(input, 'primary');
      const expected: DataIdentifier[] = [
        'card.primary.issuer',
        'card.primary.name',
        'card.primary.number',
        'card.primary.expiration',
        'card.primary.cvc',
        'card.primary.billing_address.country',
        'card.primary.billing_address.zip',
      ];

      expect(result).toEqual(expected);
    });

    it('should return the same order if input is already sorted and filtered for cards', () => {
      const input: Attribute[] = [
        { ...defaultAttribute, identifier: 'card.primary.issuer' },
        { ...defaultAttribute, identifier: 'card.primary.name' },
        { ...defaultAttribute, identifier: 'card.primary.number' },
        { ...defaultAttribute, identifier: 'card.primary.expiration' },
        { ...defaultAttribute, identifier: 'card.primary.cvc' },
      ];

      const result = getCardDis(input, 'primary');
      const expected: DataIdentifier[] = input.map(attr => attr.identifier);

      expect(result).toEqual(expected);
    });

    it('should sort by subkey if primary key is the same for cards', () => {
      const input: Attribute[] = [
        { ...defaultAttribute, identifier: 'card.primary.billing_address.zip' },
        { ...defaultAttribute, identifier: 'card.primary.billing_address.country' },
      ];

      const result = getCardDis(input, 'primary');
      const expected: DataIdentifier[] = ['card.primary.billing_address.country', 'card.primary.billing_address.zip'];

      expect(result).toEqual(expected);
    });

    it('should default to card case when no type parameter is provided', () => {
      const input: Attribute[] = [
        { ...defaultAttribute, identifier: 'card.primary.name' },
        { ...defaultAttribute, identifier: 'card.primary.issuer' },
        { ...defaultAttribute, identifier: 'card.primary.number' },
        { ...defaultAttribute, identifier: 'card.primary.expiration' },
        { ...defaultAttribute, identifier: 'card.primary.cvc' },
        { ...defaultAttribute, identifier: 'card.primary.expiration_month' },
        { ...defaultAttribute, identifier: 'card.primary.expiration_year' },
        { ...defaultAttribute, identifier: 'card.primary.number_last4' },
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
      const input: Attribute[] = [
        { ...defaultAttribute, identifier: 'bank.account1.ach_routing_number' },
        { ...defaultAttribute, identifier: 'bank.account1.name' },
        { ...defaultAttribute, identifier: 'bank.account1.ach_account_number' },
        { ...defaultAttribute, identifier: 'bank.account1.account_type' },
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
      const input: Attribute[] = [
        { ...defaultAttribute, identifier: 'bank.account1.name' },
        { ...defaultAttribute, identifier: 'bank.account1.ach_account_number' },
        { ...defaultAttribute, identifier: 'bank.account2.name' },
        { ...defaultAttribute, identifier: 'bank.account2.ach_account_number' },
      ];

      const result = getBankDis(input, 'account3');
      expect(result).toEqual([]);
    });
  });

  it('should handle empty input', () => {
    const input: Attribute[] = [];
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

describe('attributesToDIs', () => {
  it('should convert attributes to DIs', () => {
    const input = [
      { ...defaultAttribute, identifier: 'card.primary.name' as DataIdentifier },
      { ...defaultAttribute, identifier: 'card.primary.issuer' as DataIdentifier },
    ];
    const result = attributesToDIs(input);
    const expected = ['card.primary.name', 'card.primary.issuer'];
    expect(result).toEqual(expected);
  });
});
