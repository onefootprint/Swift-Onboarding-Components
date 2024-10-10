import type { Entity } from '@onefootprint/types';
import { EntityKind, EntityStatus } from '@onefootprint/types';
import { CardDIField, DataKind, IdDI } from '@onefootprint/types';

const entityFixture: Entity = {
  id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
  isIdentifiable: true,
  kind: EntityKind.business,
  data: [],
  attributes: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  lastActivityAt: '2023-03-27T14:43:47.444716Z',
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  status: EntityStatus.pass,
  workflows: [
    {
      createdAt: '2023-03-27T14:43:47.444716Z',
      playbookId: 'ob_config_id_3o5SdynZVGO1icDm8Z6llC',
      insightEvent: {
        timestamp: '2023-04-03T17:42:30.799202Z',
        ipAddress: '67.243.21.56',
        city: 'New York',
        country: 'United States',
        region: 'NY',
        regionName: 'New York',
        latitude: 40.7365,
        longitude: -74.0055,
        metroCode: '501',
        postalCode: '10014',
        timeZone: 'America/New_York',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15',
      },
    },
  ],
  requiresManualReview: false,
  decryptableAttributes: [],
  decryptedAttributes: {},
  label: null,
};

const defaultField = {
  isDecryptable: true,
  dataKind: DataKind.vaultData,
  transforms: {},
  source: 'source',
};

const entityWithMissingData: Entity = {
  ...entityFixture,
  data: [
    {
      ...defaultField,
      identifier: `card.hayes.${CardDIField.issuer}`,
      value: null,
    },
    {
      ...defaultField,
      identifier: `card.hayes.${CardDIField.expirationMonth}`,
      value: null,
    },
    {
      ...defaultField,
      identifier: `card.hayes.${CardDIField.expirationYear}`,
      value: null,
    },
    {
      ...defaultField,
      identifier: `card.hayes.${CardDIField.fingerprint}`,
      value: 'hayes_fingerprint_123',
    },
    {
      ...defaultField,
      identifier: `card.nopa.${CardDIField.name}`,
      value: null,
    },
    {
      ...defaultField,
      identifier: `card.nopa.${CardDIField.issuer}`,
      value: null,
    },
    {
      ...defaultField,
      identifier: `card.nopa.${CardDIField.fingerprint}`,
      value: 'nopa_fingerprint_456',
    },
  ],
};

const entityWithExistingData: Entity = {
  ...entityFixture,
  data: [
    {
      ...defaultField,
      identifier: `card.hayes.${CardDIField.issuer}`,
      value: 'visa',
    },
    {
      ...defaultField,
      identifier: `card.hayes.${CardDIField.expirationMonth}`,
      value: '05',
    },
    {
      ...defaultField,
      identifier: `card.hayes.${CardDIField.expirationYear}`,
      value: '2025',
    },
    {
      ...defaultField,
      identifier: `card.hayes.${CardDIField.fingerprint}`,
      value: 'hayes_fingerprint_789',
    },
    {
      ...defaultField,
      identifier: `card.nopa.${CardDIField.name}`,
      value: 'Johnny Appleseed',
    },
    {
      ...defaultField,
      identifier: `card.nopa.${CardDIField.issuer}`,
      value: 'mastercard',
    },
    {
      ...defaultField,
      identifier: `card.nopa.${CardDIField.number}`,
      value: null,
    },
    {
      ...defaultField,
      identifier: `card.nopa.${CardDIField.fingerprint}`,
      value: 'nopa_fingerprint_012',
    },
  ],
};

const entityWithTwoCards: Entity = {
  ...entityFixture,
  data: [
    {
      ...defaultField,
      identifier: `card.hayes.${CardDIField.issuer}`,
      value: 'visa',
    },
    {
      ...defaultField,
      identifier: `card.hayes.${CardDIField.fingerprint}`,
      value: 'hayes_fingerprint_345',
    },
    {
      ...defaultField,
      identifier: `card.nopa.${CardDIField.issuer}`,
      value: 'mastercard',
    },
    {
      ...defaultField,
      identifier: `card.nopa.${CardDIField.fingerprint}`,
      value: 'nopa_fingerprint_678',
    },
  ],
};

const entityWithMultipleFields: Entity = {
  ...entityFixture,
  data: [
    {
      ...defaultField,
      identifier: `card.hayes.${CardDIField.issuer}`,
      value: 'visa',
    },
    {
      ...defaultField,
      identifier: `card.hayes.${CardDIField.numberLast4}`,
      value: '4242',
    },
    {
      ...defaultField,
      identifier: `card.hayes.${CardDIField.expirationMonth}`,
      value: '05',
    },
    {
      ...defaultField,
      identifier: `card.hayes.${CardDIField.expirationYear}`,
      value: '2025',
    },
    {
      ...defaultField,
      identifier: `card.hayes.${CardDIField.fingerprint}`,
      value: 'hayes_fingerprint_901',
    },
    {
      ...defaultField,
      identifier: `card.nopa.${CardDIField.issuer}`,
      value: 'mastercard',
    },
    {
      ...defaultField,
      identifier: `card.nopa.${CardDIField.fingerprint}`,
      value: 'nopa_fingerprint_234',
    },
  ],
};

const entityWithNoData: Entity = {
  ...entityFixture,
  data: [],
};

const entityWithNonCardData: Entity = {
  ...entityFixture,
  data: [
    {
      ...defaultField,
      identifier: IdDI.firstName,
      value: 'Jane',
    },
    {
      ...defaultField,
      identifier: IdDI.lastName,
      value: 'Doe',
    },
  ],
};

const entityWithThreeCards: Entity = {
  ...entityFixture,
  data: [
    {
      ...defaultField,
      identifier: `card.visa.${CardDIField.issuer}`,
      value: 'visa',
    },
    {
      ...defaultField,
      identifier: `card.visa.${CardDIField.number}`,
      value: '4111111111111111',
    },
    {
      ...defaultField,
      identifier: `card.visa.${CardDIField.numberLast4}`,
      value: '1111',
    },
    {
      ...defaultField,
      identifier: `card.visa.${CardDIField.expirationMonth}`,
      value: '12',
    },
    {
      ...defaultField,
      identifier: `card.visa.${CardDIField.expirationYear}`,
      value: '2025',
    },
    {
      ...defaultField,
      identifier: `card.visa.${CardDIField.name}`,
      value: 'John Doe',
    },
    {
      ...defaultField,
      identifier: `card.visa.${CardDIField.fingerprint}`,
      value: 'visa_fingerprint_567',
    },
    {
      ...defaultField,
      identifier: `card.mastercard.${CardDIField.issuer}`,
      value: 'mastercard',
    },
    {
      ...defaultField,
      identifier: `card.mastercard.${CardDIField.number}`,
      value: '5555555555554444',
    },
    {
      ...defaultField,
      identifier: `card.mastercard.${CardDIField.numberLast4}`,
      value: '4444',
    },
    {
      ...defaultField,
      identifier: `card.mastercard.${CardDIField.expirationMonth}`,
      value: '06',
    },
    {
      ...defaultField,
      identifier: `card.mastercard.${CardDIField.expirationYear}`,
      value: '2024',
    },
    {
      ...defaultField,
      identifier: `card.mastercard.${CardDIField.name}`,
      value: 'Jane Smith',
    },
    {
      ...defaultField,
      identifier: `card.mastercard.${CardDIField.fingerprint}`,
      value: 'mastercard_fingerprint_890',
    },
    {
      ...defaultField,
      identifier: `card.amex.${CardDIField.issuer}`,
      value: 'amex',
    },
    {
      ...defaultField,
      identifier: `card.amex.${CardDIField.number}`,
      value: '378282246310005',
    },
    {
      ...defaultField,
      identifier: `card.amex.${CardDIField.numberLast4}`,
      value: '0005',
    },
    {
      ...defaultField,
      identifier: `card.amex.${CardDIField.expirationMonth}`,
      value: '03',
    },
    {
      ...defaultField,
      identifier: `card.amex.${CardDIField.expirationYear}`,
      value: '2026',
    },
    {
      ...defaultField,
      identifier: `card.amex.${CardDIField.name}`,
      value: 'Bob Johnson',
    },
    {
      ...defaultField,
      identifier: `card.amex.${CardDIField.fingerprint}`,
      value: 'amex_fingerprint_123',
    },
  ],
};

export {
  entityWithMissingData,
  entityWithExistingData,
  entityWithTwoCards,
  entityWithMultipleFields,
  entityWithNoData,
  entityWithNonCardData,
  entityWithThreeCards,
};
