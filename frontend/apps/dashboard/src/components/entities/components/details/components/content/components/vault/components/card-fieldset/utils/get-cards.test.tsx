import type { Entity } from '@onefootprint/types';

import getCardFromEntity from './get-cards';
import entityFixture from './get-cards.test.config';

describe('getCards', () => {
  describe('handles encrypted and decrypted attributes properly', () => {
    it('should return null for encrypted attrs', () => {
      const entity: Entity = {
        ...entityFixture,
        attributes: [
          'card.hayes.issuer',
          'card.hayes.expiration_month',
          'card.hayes.expiration_year',
          'card.nopa.name',
          'card.nopa.issuer',
        ],
        decryptedAttributes: {},
      };

      expect(getCardFromEntity(entity)).toEqual([
        {
          alias: 'hayes',
          issuer: null,
          expiration_month: null,
          expiration_year: null,
        },
        { alias: 'nopa', issuer: null, name: null },
      ]);
    });

    it('should return null for encrypted attrs but replace with values if we have decrypted attrs', () => {
      const entity: Entity = {
        ...entityFixture,
        attributes: [
          'card.hayes.issuer',
          'card.hayes.expiration_month',
          'card.hayes.expiration_year',
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
          expiration_month: null,
          expiration_year: null,
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
    it('should return the correct shape, no longer nesting attributes', () => {
      const entity: Entity = {
        ...entityFixture,
        decryptedAttributes: {
          'card.hayes.issuer': 'visa',
          'card.hayes.number_last4': '4242',
          'card.nopa.issuer': 'mastercard',
          'card.hayes.expiration_month': '05',
          'card.hayes.expiration_year': '2025',
        },
      };
      expect(getCardFromEntity(entity)).toEqual([
        {
          alias: 'hayes',
          issuer: 'visa',
          number_last4: '4242',
          expiration_month: '05',
          expiration_year: '2025',
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
