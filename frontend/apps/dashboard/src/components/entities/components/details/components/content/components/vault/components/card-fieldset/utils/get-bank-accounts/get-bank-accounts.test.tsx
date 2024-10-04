import type { Entity } from '@onefootprint/types';
import { BankDIField } from '@onefootprint/types';

import getBankAccountsFromEntity from './get-bank-accounts';
import entityFixture from './get-bank-accounts.test.config';

describe('getBankAccounts', () => {
  describe('handles encrypted and decrypted attributes properly', () => {
    it('should return null for encrypted attrs', () => {
      const entity: Entity = {
        ...entityFixture,
        attributes: [
          `bank.chase.${BankDIField.accountNumber}`,
          `bank.chase.${BankDIField.routingNumber}`,
          `bank.chase.${BankDIField.accountType}`,
          `bank.wells.${BankDIField.name}`,
          `bank.wells.${BankDIField.accountNumber}`,
        ],
        decryptedAttributes: {},
      };

      const result = getBankAccountsFromEntity(entity);
      expect(result).toEqual([
        {
          alias: 'chase',
          [BankDIField.accountNumber]: null,
          [BankDIField.routingNumber]: null,
          [BankDIField.accountType]: null,
        },
        { alias: 'wells', [BankDIField.name]: null, [BankDIField.accountNumber]: null },
      ]);
    });

    it('should return null for encrypted attrs but replace with values if we have decrypted attrs', () => {
      const entity: Entity = {
        ...entityFixture,
        attributes: [
          `bank.chase.${BankDIField.accountNumber}`,
          `bank.chase.${BankDIField.routingNumber}`,
          `bank.chase.${BankDIField.accountType}`,
          `bank.wells.${BankDIField.name}`,
          `bank.wells.${BankDIField.accountNumber}`,
        ],
        decryptedAttributes: {
          [`bank.chase.${BankDIField.accountNumber}`]: '1234567890',
          [`bank.wells.${BankDIField.name}`]: 'John Doe',
        },
      };

      const result = getBankAccountsFromEntity(entity);
      expect(result).toEqual([
        {
          alias: 'chase',
          [BankDIField.accountNumber]: '1234567890',
          [BankDIField.routingNumber]: null,
          [BankDIField.accountType]: null,
        },
        {
          alias: 'wells',
          [BankDIField.name]: 'John Doe',
          [BankDIField.accountNumber]: null,
        },
      ]);
    });
  });

  describe('with two bank accounts that only have decrypted account numbers', () => {
    it('should return the correct shape', () => {
      const entity: Entity = {
        ...entityFixture,
        decryptedAttributes: {
          [`bank.chase.${BankDIField.accountNumber}`]: '1234567890',
          [`bank.wells.${BankDIField.accountNumber}`]: '0987654321',
        },
      };
      const result = getBankAccountsFromEntity(entity);
      expect(result).toEqual([
        { alias: 'chase', [BankDIField.accountNumber]: '1234567890' },
        { alias: 'wells', [BankDIField.accountNumber]: '0987654321' },
      ]);
    });
  });

  describe('with nested attributes', () => {
    it('should return the correct shape, no longer nesting attributes', () => {
      const entity: Entity = {
        ...entityFixture,
        decryptedAttributes: {
          [`bank.chase.${BankDIField.accountNumber}`]: '1234567890',
          [`bank.chase.${BankDIField.routingNumber}`]: '021000021',
          [`bank.wells.${BankDIField.accountNumber}`]: '0987654321',
          [`bank.chase.${BankDIField.accountType}`]: 'checking',
          [`bank.chase.${BankDIField.name}`]: 'Chase Bank',
        },
      };
      const result = getBankAccountsFromEntity(entity);
      expect(result).toEqual([
        {
          alias: 'chase',
          [BankDIField.accountNumber]: '1234567890',
          [BankDIField.routingNumber]: '021000021',
          [BankDIField.accountType]: 'checking',
          [BankDIField.name]: 'Chase Bank',
        },
        { alias: 'wells', [BankDIField.accountNumber]: '0987654321' },
      ]);
    });
  });

  describe('with no decrypted attributes', () => {
    it('should return an empty array', () => {
      const entity: Entity = {
        ...entityFixture,
        decryptedAttributes: {},
      };
      const result = getBankAccountsFromEntity(entity);
      expect(result).toEqual([]);
    });
  });

  describe('with decrypted attributes, but none related to bank accounts', () => {
    it('should return an empty array', () => {
      const entity: Entity = {
        ...entityFixture,
        decryptedAttributes: {
          'id.first_name': 'Jane',
          'id.last_name': 'Doe',
        },
      };
      const result = getBankAccountsFromEntity(entity);
      expect(result).toEqual([]);
    });
  });

  describe('with three bank accounts with different aliases', () => {
    it('should return the accounts sorted alphabetically by alias with all relevant DIs', () => {
      const entity: Entity = {
        ...entityFixture,
        decryptedAttributes: {
          [`bank.chase.${BankDIField.accountNumber}`]: '1234567890',
          [`bank.chase.${BankDIField.routingNumber}`]: '021000021',
          [`bank.chase.${BankDIField.accountType}`]: 'checking',
          [`bank.chase.${BankDIField.name}`]: 'Chase Checking',
          [`bank.wells.${BankDIField.accountNumber}`]: '0987654321',
          [`bank.wells.${BankDIField.routingNumber}`]: '121000248',
          [`bank.wells.${BankDIField.accountType}`]: 'savings',
          [`bank.wells.${BankDIField.name}`]: 'Wells Fargo Savings',
          [`bank.bofa.${BankDIField.accountNumber}`]: '5678901234',
          [`bank.bofa.${BankDIField.routingNumber}`]: '026009593',
          [`bank.bofa.${BankDIField.accountType}`]: 'checking',
          [`bank.bofa.${BankDIField.name}`]: 'Bank of America Checking',
        },
      };
      const result = getBankAccountsFromEntity(entity);
      const expectedResult = [
        {
          alias: 'bofa',
          [BankDIField.accountNumber]: '5678901234',
          [BankDIField.routingNumber]: '026009593',
          [BankDIField.accountType]: 'checking',
          [BankDIField.name]: 'Bank of America Checking',
        },
        {
          alias: 'chase',
          [BankDIField.accountNumber]: '1234567890',
          [BankDIField.routingNumber]: '021000021',
          [BankDIField.accountType]: 'checking',
          [BankDIField.name]: 'Chase Checking',
        },
        {
          alias: 'wells',
          [BankDIField.accountNumber]: '0987654321',
          [BankDIField.routingNumber]: '121000248',
          [BankDIField.accountType]: 'savings',
          [BankDIField.name]: 'Wells Fargo Savings',
        },
      ];
      expect(result).toEqual(expectedResult);
      expect(result[0].alias).toBe('bofa');
      expect(result[1].alias).toBe('chase');
      expect(result[2].alias).toBe('wells');
    });
  });
});
