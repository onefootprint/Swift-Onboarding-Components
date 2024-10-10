import getCardFromEntity from './get-cards';
import {
  entityWithExistingData,
  entityWithMissingData,
  entityWithMultipleFields,
  entityWithNoData,
  entityWithNonCardData,
  entityWithThreeCards,
  entityWithTwoCards,
} from './get-cards.test.config';

describe('getCards', () => {
  describe('handles data properly', () => {
    it('should return null for missing data', () => {
      const result = getCardFromEntity(entityWithMissingData);
      expect(result).toEqual([
        {
          alias: 'hayes',
          issuer: null,
          expiration_month: null,
          expiration_year: null,
          fingerprint: 'hayes_fingerprint_123',
        },
        {
          alias: 'nopa',
          issuer: null,
          name: null,
          fingerprint: 'nopa_fingerprint_456',
        },
      ]);
    });

    it('should return values for existing data', () => {
      const result = getCardFromEntity(entityWithExistingData);
      expect(result).toEqual([
        {
          alias: 'hayes',
          issuer: 'visa',
          expiration_month: '05',
          expiration_year: '2025',
          fingerprint: 'hayes_fingerprint_789',
        },
        {
          alias: 'nopa',
          issuer: 'mastercard',
          name: 'Johnny Appleseed',
          number: null,
          fingerprint: 'nopa_fingerprint_012',
        },
      ]);
    });
  });

  describe('with two cards that only have issuer', () => {
    it('should return the correct shape', () => {
      const result = getCardFromEntity(entityWithTwoCards);
      expect(result).toEqual([
        {
          alias: 'hayes',
          issuer: 'visa',
          fingerprint: 'hayes_fingerprint_345',
        },
        {
          alias: 'nopa',
          issuer: 'mastercard',
          fingerprint: 'nopa_fingerprint_678',
        },
      ]);
    });
  });

  describe('with multiple fields', () => {
    it('should return the correct shape with all fields', () => {
      const result = getCardFromEntity(entityWithMultipleFields);
      expect(result).toEqual([
        {
          alias: 'hayes',
          issuer: 'visa',
          number_last4: '4242',
          expiration_month: '05',
          expiration_year: '2025',
          fingerprint: 'hayes_fingerprint_901',
        },
        {
          alias: 'nopa',
          issuer: 'mastercard',
          fingerprint: 'nopa_fingerprint_234',
        },
      ]);
    });
  });

  describe('with no data', () => {
    it('should return an empty array', () => {
      const result = getCardFromEntity(entityWithNoData);
      expect(result).toEqual([]);
    });
  });

  describe('with data, but none related to card', () => {
    it('should return an empty array', () => {
      const result = getCardFromEntity(entityWithNonCardData);
      expect(result).toEqual([]);
    });
  });

  describe('with three cards and all card DIs', () => {
    it('should return a sorted array of the DIs that is alphabetically correct', () => {
      const result = getCardFromEntity(entityWithThreeCards);
      expect(result).toEqual([
        {
          alias: 'amex',
          issuer: 'amex',
          number: '378282246310005',
          number_last4: '0005',
          expiration_month: '03',
          expiration_year: '2026',
          name: 'Bob Johnson',
          fingerprint: 'amex_fingerprint_123',
        },
        {
          alias: 'mastercard',
          issuer: 'mastercard',
          number: '5555555555554444',
          number_last4: '4444',
          expiration_month: '06',
          expiration_year: '2024',
          name: 'Jane Smith',
          fingerprint: 'mastercard_fingerprint_890',
        },
        {
          alias: 'visa',
          issuer: 'visa',
          number: '4111111111111111',
          number_last4: '1111',
          expiration_month: '12',
          expiration_year: '2025',
          name: 'John Doe',
          fingerprint: 'visa_fingerprint_567',
        },
      ]);
      const element = result[0];
      expect(element.alias).toBe('amex');
      expect(element.fingerprint).toBe('amex_fingerprint_123');
      const element1 = result[1];
      expect(element1.alias).toBe('mastercard');
      expect(element1.fingerprint).toBe('mastercard_fingerprint_890');
      const element2 = result[2];
      expect(element2.alias).toBe('visa');
      expect(element2.fingerprint).toBe('visa_fingerprint_567');
    });
  });
});
