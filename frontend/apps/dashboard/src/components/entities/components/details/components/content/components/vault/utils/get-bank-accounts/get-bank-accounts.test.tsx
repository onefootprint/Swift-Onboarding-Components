import { BankDIField } from '@onefootprint/types';

import getBankAccountsFromEntity from './get-bank-accounts';
import {
  entityWithExistingData,
  entityWithMissingData,
  entityWithNestedAttributes,
  entityWithNoData,
  entityWithNonBankData,
  entityWithThreeBankAccounts,
  entityWithTwoAccountNumbers,
} from './get-bank-accounts.test.config';

describe('getBankAccounts', () => {
  describe('handles data properly', () => {
    it('should return null for missing data', () => {
      const result = getBankAccountsFromEntity(entityWithMissingData);
      expect(result).toEqual([
        {
          alias: 'chase',
          [BankDIField.accountNumber]: null,
          [BankDIField.routingNumber]: null,
          [BankDIField.accountType]: null,
          [BankDIField.fingerprint]: 'chase_fingerprint_123',
        },
        {
          alias: 'wells',
          [BankDIField.name]: null,
          [BankDIField.accountNumber]: null,
          [BankDIField.fingerprint]: 'wells_fingerprint_456',
        },
      ]);
    });

    it('should return values for existing data', () => {
      const result = getBankAccountsFromEntity(entityWithExistingData);
      expect(result).toEqual([
        {
          alias: 'chase',
          [BankDIField.accountNumber]: '1234567890',
          [BankDIField.routingNumber]: null,
          [BankDIField.accountType]: null,
          [BankDIField.fingerprint]: 'chase_fingerprint_789',
        },
        {
          alias: 'wells',
          [BankDIField.name]: 'John Doe',
          [BankDIField.accountNumber]: null,
          [BankDIField.fingerprint]: 'wells_fingerprint_012',
        },
      ]);
    });
  });

  describe('with two bank accounts that only have account numbers', () => {
    it('should return the correct shape', () => {
      const result = getBankAccountsFromEntity(entityWithTwoAccountNumbers);
      expect(result).toEqual([
        {
          alias: 'chase',
          [BankDIField.accountNumber]: '1234567890',
          [BankDIField.fingerprint]: 'chase_fingerprint_345',
        },
        {
          alias: 'wells',
          [BankDIField.accountNumber]: '0987654321',
          [BankDIField.fingerprint]: 'wells_fingerprint_678',
        },
      ]);
    });
  });

  describe('with nested attributes', () => {
    it('should return the correct shape, no longer nesting attributes', () => {
      const result = getBankAccountsFromEntity(entityWithNestedAttributes);
      expect(result).toEqual([
        {
          alias: 'chase',
          [BankDIField.accountNumber]: '1234567890',
          [BankDIField.routingNumber]: '021000021',
          [BankDIField.accountType]: 'checking',
          [BankDIField.name]: 'Chase Bank',
          [BankDIField.fingerprint]: 'chase_fingerprint_901',
        },
        {
          alias: 'wells',
          [BankDIField.accountNumber]: '0987654321',
          [BankDIField.fingerprint]: 'wells_fingerprint_234',
        },
      ]);
    });
  });

  describe('with no data', () => {
    it('should return an empty array', () => {
      const result = getBankAccountsFromEntity(entityWithNoData);
      expect(result).toEqual([]);
    });
  });

  describe('with data, but none related to bank accounts', () => {
    it('should return an empty array', () => {
      const result = getBankAccountsFromEntity(entityWithNonBankData);
      expect(result).toEqual([]);
    });
  });

  describe('with three bank accounts with different aliases', () => {
    it('should return the accounts sorted alphabetically by alias with all relevant DIs', () => {
      const result = getBankAccountsFromEntity(entityWithThreeBankAccounts);
      const expectedResult = [
        {
          alias: 'bofa',
          [BankDIField.accountNumber]: '5678901234',
          [BankDIField.routingNumber]: '026009593',
          [BankDIField.accountType]: 'checking',
          [BankDIField.name]: 'Bank of America Checking',
          [BankDIField.fingerprint]: 'bofa_fingerprint_123',
        },
        {
          alias: 'chase',
          [BankDIField.accountNumber]: '1234567890',
          [BankDIField.routingNumber]: '021000021',
          [BankDIField.accountType]: 'checking',
          [BankDIField.name]: 'Chase Checking',
          [BankDIField.fingerprint]: 'chase_fingerprint_567',
        },
        {
          alias: 'wells',
          [BankDIField.accountNumber]: '0987654321',
          [BankDIField.routingNumber]: '121000248',
          [BankDIField.accountType]: 'savings',
          [BankDIField.name]: 'Wells Fargo Savings',
          [BankDIField.fingerprint]: 'wells_fingerprint_890',
        },
      ];
      expect(result).toEqual(expectedResult);
      expect(result[0].alias).toBe('bofa');
      expect(result[1].alias).toBe('chase');
      expect(result[2].alias).toBe('wells');
    });
  });
});
