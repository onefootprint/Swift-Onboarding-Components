import { Entity } from '@onefootprint/types';

import getCardFromEntity from './get-cards';
import entityFixture from './get-cards.test.config';

describe('getCards', () => {
  describe('handles encrypted and decrypted attributes properly', () => {
    it('should return null for encrypted attrs', () => {
      const entity: Entity = {
        ...entityFixture,
        attributes: [
          'card.hayes.issuer',
          'card.hayes.expiration.month',
          'card.hayes.expiration.year',
          'card.nopa.name',
          'card.nopa.issuer',
        ],
        decryptedAttributes: {},
      };

      expect(getCardFromEntity(entity)).toEqual([
        {
          alias: 'hayes',
          issuer: null,
          expiration: { month: null, year: null },
        },
        { alias: 'nopa', issuer: null, name: null },
      ]);
    });

    it('should return null for encrypted attrs but replace with values if we have decrypted attrs', () => {
      const entity: Entity = {
        ...entityFixture,
        attributes: [
          'card.hayes.issuer',
          'card.hayes.expiration.month',
          'card.hayes.expiration.year',
          'card.nopa.name',
          'card.nopa.issuer',
          'card.nopa.number',
        ],
        decryptedAttributes: {
          'card.hayes.issuer': 'visa',
          'card.nopa.name': 'Johnny Appleseed',
          'card.nopa.issuer': 'mastercard',
        },
      };

      expect(getCardFromEntity(entity)).toEqual([
        {
          alias: 'hayes',
          issuer: 'visa',
          expiration: { month: null, year: null },
        },
        {
          alias: 'nopa',
          issuer: 'mastercard',
          name: 'Johnny Appleseed',
          number: null,
        },
      ]);
    });
  });

  describe('with two cards that only have decrypted issuer', () => {
    it('should return the correct shape', () => {
      const entity: Entity = {
        ...entityFixture,
        decryptedAttributes: {
          'card.hayes.issuer': 'visa',
          'card.nopa.issuer': 'mastercard',
        },
      };
      expect(getCardFromEntity(entity)).toEqual([
        { alias: 'hayes', issuer: 'visa' },
        { alias: 'nopa', issuer: 'mastercard' },
      ]);
    });
  });

  describe('with nested attributes', () => {
    it('should return the correct shape and nest attributes properly', () => {
      const entity: Entity = {
        ...entityFixture,
        decryptedAttributes: {
          'card.hayes.issuer': 'visa',
          'card.hayes.number.last4': '4242',
          'card.nopa.issuer': 'mastercard',
          'card.hayes.expiration.month': '05',
          'card.hayes.expiration.year': '2025',
        },
      };
      expect(getCardFromEntity(entity)).toEqual([
        {
          alias: 'hayes',
          issuer: 'visa',
          number: {
            last4: '4242',
          },
          expiration: { month: '05', year: '2025' },
        },
        { alias: 'nopa', issuer: 'mastercard' },
      ]);
    });
  });

  describe('with no decrypted attributes', () => {
    it('should return an empty array', () => {
      const entity: Entity = {
        ...entityFixture,
        decryptedAttributes: {},
      };
      expect(getCardFromEntity(entity)).toEqual([]);
    });
  });

  describe('with decrypted attributes, but none related to card', () => {
    it('should return an empty array', () => {
      const entity: Entity = {
        ...entityFixture,
        decryptedAttributes: {
          'id.first_name': 'Jane',
          'id.last_name': 'Doe',
        },
      };
      expect(getCardFromEntity(entity)).toEqual([]);
    });
  });
});
