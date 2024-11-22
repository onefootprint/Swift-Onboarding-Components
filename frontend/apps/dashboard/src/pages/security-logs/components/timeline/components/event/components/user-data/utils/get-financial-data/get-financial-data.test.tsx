import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import getFinancialData from './get-financial-data';

describe('getFinancialData', () => {
  describe('with no financial data', () => {
    it('returns empty arrays and false flag', () => {
      const data = getFinancialData(['id.first_name' as DataIdentifier, 'id.last_name' as DataIdentifier]);

      expect(data.cards).toHaveLength(0);
      expect(data.bankAccounts).toHaveLength(0);
      expect(data.hasFinancialData).toBe(false);
    });
  });

  describe('with card data', () => {
    it('correctly groups single card data', () => {
      const data = getFinancialData([
        'card.123.issuer' as DataIdentifier,
        'card.123.number_last4' as DataIdentifier,
        'card.123.name' as DataIdentifier,
      ]);

      expect(data.cards).toHaveLength(1);
      expect(data.cards[0]).toEqual({
        name: '123',
        fields: ['card.*.issuer', 'card.*.number_last4', 'card.*.name'],
      });
      expect(data.bankAccounts).toHaveLength(0);
      expect(data.hasFinancialData).toBe(true);
    });

    it('correctly groups multiple cards data', () => {
      const data = getFinancialData([
        'card.123.issuer' as DataIdentifier,
        'card.123.number_last4' as DataIdentifier,
        'card.123.name' as DataIdentifier,
        'card.456.issuer' as DataIdentifier,
        'card.456.number_last4' as DataIdentifier,
        'card.456.name' as DataIdentifier,
        'card.789.issuer' as DataIdentifier,
        'card.789.number_last4' as DataIdentifier,
        'card.789.name' as DataIdentifier,
      ]);

      expect(data.cards).toHaveLength(3);
      expect(data.cards[0]).toEqual({
        name: '123',
        fields: ['card.*.issuer', 'card.*.number_last4', 'card.*.name'],
      });
      expect(data.cards[1]).toEqual({
        name: '456',
        fields: ['card.*.issuer', 'card.*.number_last4', 'card.*.name'],
      });
      expect(data.cards[2]).toEqual({
        name: '789',
        fields: ['card.*.issuer', 'card.*.number_last4', 'card.*.name'],
      });
      expect(data.bankAccounts).toHaveLength(0);
      expect(data.hasFinancialData).toBe(true);
    });
  });

  describe('with bank data', () => {
    it('correctly groups single bank account data', () => {
      const data = getFinancialData([
        'bank.123.name' as DataIdentifier,
        'bank.123.ach_routing_number' as DataIdentifier,
        'bank.123.ach_account_number' as DataIdentifier,
      ]);

      expect(data.cards).toHaveLength(0);
      expect(data.bankAccounts).toHaveLength(1);
      expect(data.bankAccounts[0]).toEqual({
        name: '123',
        fields: ['bank.*.name', 'bank.*.ach_routing_number', 'bank.*.ach_account_number'],
      });
      expect(data.hasFinancialData).toBe(true);
    });

    it('correctly groups multiple bank accounts data', () => {
      const data = getFinancialData([
        'bank.123.name' as DataIdentifier,
        'bank.123.ach_routing_number' as DataIdentifier,
        'bank.456.name' as DataIdentifier,
        'bank.456.ach_account_number' as DataIdentifier,
        'bank.789.name' as DataIdentifier,
        'bank.789.ach_routing_number' as DataIdentifier,
      ]);

      expect(data.cards).toHaveLength(0);
      expect(data.bankAccounts).toHaveLength(3);
      expect(data.bankAccounts[0]).toEqual({
        name: '123',
        fields: ['bank.*.name', 'bank.*.ach_routing_number'],
      });
      expect(data.bankAccounts[1]).toEqual({
        name: '456',
        fields: ['bank.*.name', 'bank.*.ach_account_number'],
      });
      expect(data.bankAccounts[2]).toEqual({
        name: '789',
        fields: ['bank.*.name', 'bank.*.ach_routing_number'],
      });
      expect(data.hasFinancialData).toBe(true);
    });
  });

  describe('with mixed financial data', () => {
    it('correctly groups single card and bank account', () => {
      const data = getFinancialData([
        'card.123.issuer' as DataIdentifier,
        'card.123.number_last4' as DataIdentifier,
        'card.123.name' as DataIdentifier,
        'bank.456.name' as DataIdentifier,
        'bank.456.ach_routing_number' as DataIdentifier,
      ]);

      expect(data.cards).toHaveLength(1);
      expect(data.cards[0]).toEqual({
        name: '123',
        fields: ['card.*.issuer', 'card.*.number_last4', 'card.*.name'],
      });
      expect(data.bankAccounts).toHaveLength(1);
      expect(data.bankAccounts[0]).toEqual({
        name: '456',
        fields: ['bank.*.name', 'bank.*.ach_routing_number'],
      });
      expect(data.hasFinancialData).toBe(true);
    });

    it('correctly groups multiple cards and bank accounts', () => {
      const data = getFinancialData([
        'card.123.issuer' as DataIdentifier,
        'card.123.number_last4' as DataIdentifier,
        'card.123.name' as DataIdentifier,
        'card.456.issuer' as DataIdentifier,
        'card.456.number_last4' as DataIdentifier,
        'card.456.name' as DataIdentifier,
        'card.789.issuer' as DataIdentifier,
        'card.789.number_last4' as DataIdentifier,
        'card.789.name' as DataIdentifier,
        'bank.abc.name' as DataIdentifier,
        'bank.abc.ach_routing_number' as DataIdentifier,
        'bank.def.name' as DataIdentifier,
        'bank.def.ach_account_number' as DataIdentifier,
        'bank.ghi.name' as DataIdentifier,
        'bank.ghi.ach_routing_number' as DataIdentifier,
      ]);

      expect(data.cards).toHaveLength(3);
      expect(data.cards[0]).toEqual({
        name: '123',
        fields: ['card.*.issuer', 'card.*.number_last4', 'card.*.name'],
      });
      expect(data.cards[1]).toEqual({
        name: '456',
        fields: ['card.*.issuer', 'card.*.number_last4', 'card.*.name'],
      });
      expect(data.cards[2]).toEqual({
        name: '789',
        fields: ['card.*.issuer', 'card.*.number_last4', 'card.*.name'],
      });
      expect(data.bankAccounts).toHaveLength(3);
      expect(data.bankAccounts[0]).toEqual({
        name: 'abc',
        fields: ['bank.*.name', 'bank.*.ach_routing_number'],
      });
      expect(data.bankAccounts[1]).toEqual({
        name: 'def',
        fields: ['bank.*.name', 'bank.*.ach_account_number'],
      });
      expect(data.bankAccounts[2]).toEqual({
        name: 'ghi',
        fields: ['bank.*.name', 'bank.*.ach_routing_number'],
      });
      expect(data.hasFinancialData).toBe(true);
    });
  });
});
