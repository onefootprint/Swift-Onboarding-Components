import type { Entity } from '@onefootprint/types';
import { BankDIField, DataKind, EntityKind, EntityStatus, IdDI } from '@onefootprint/types';

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
  decryptedAttributes: {},
  label: null,
};

const defaultField = {
  source: 'source',
  isDecryptable: true,
  dataKind: DataKind.vaultData,
  transforms: {},
};

export const entityWithMissingData: Entity = {
  ...entityFixture,
  data: [
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.accountNumber}`,
      value: null,
    },
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.routingNumber}`,
      value: null,
    },
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.accountType}`,
      value: null,
    },
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.fingerprint}`,
      value: 'chase_fingerprint_123',
    },
    {
      ...defaultField,
      identifier: `bank.wells.${BankDIField.name}`,
      value: null,
    },
    {
      ...defaultField,
      identifier: `bank.wells.${BankDIField.accountNumber}`,
      value: null,
    },
    {
      ...defaultField,
      identifier: `bank.wells.${BankDIField.fingerprint}`,
      value: 'wells_fingerprint_456',
    },
  ],
};

export const entityWithExistingData: Entity = {
  ...entityFixture,
  data: [
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.accountNumber}`,
      value: '1234567890',
    },
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.routingNumber}`,
      value: null,
    },
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.accountType}`,
      value: null,
    },
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.fingerprint}`,
      value: 'chase_fingerprint_789',
    },
    {
      ...defaultField,
      identifier: `bank.wells.${BankDIField.name}`,
      value: 'John Doe',
    },
    {
      ...defaultField,
      identifier: `bank.wells.${BankDIField.accountNumber}`,
      value: null,
    },
    {
      ...defaultField,
      identifier: `bank.wells.${BankDIField.fingerprint}`,
      value: 'wells_fingerprint_012',
    },
  ],
};

export const entityWithTwoAccountNumbers: Entity = {
  ...entityFixture,
  data: [
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.accountNumber}`,
      value: '1234567890',
    },
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.fingerprint}`,
      value: 'chase_fingerprint_345',
    },
    {
      ...defaultField,
      identifier: `bank.wells.${BankDIField.accountNumber}`,
      value: '0987654321',
    },
    {
      ...defaultField,
      identifier: `bank.wells.${BankDIField.fingerprint}`,
      value: 'wells_fingerprint_678',
    },
  ],
};

export const entityWithNestedAttributes: Entity = {
  ...entityFixture,
  data: [
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.accountNumber}`,
      value: '1234567890',
    },
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.routingNumber}`,
      value: '021000021',
    },
    {
      ...defaultField,
      identifier: `bank.wells.${BankDIField.accountNumber}`,
      value: '0987654321',
    },
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.accountType}`,
      value: 'checking',
    },
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.name}`,
      value: 'Chase Bank',
    },
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.fingerprint}`,
      value: 'chase_fingerprint_901',
    },
    {
      ...defaultField,
      identifier: `bank.wells.${BankDIField.fingerprint}`,
      value: 'wells_fingerprint_234',
    },
  ],
};

export const entityWithNoData: Entity = {
  ...entityFixture,
  data: [],
};

export const entityWithNonBankData: Entity = {
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

export const entityWithThreeBankAccounts: Entity = {
  ...entityFixture,
  data: [
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.accountNumber}`,
      value: '1234567890',
    },
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.routingNumber}`,
      value: '021000021',
    },
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.accountType}`,
      value: 'checking',
    },
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.name}`,
      value: 'Chase Checking',
    },
    {
      ...defaultField,
      identifier: `bank.chase.${BankDIField.fingerprint}`,
      value: 'chase_fingerprint_567',
    },
    {
      ...defaultField,
      identifier: `bank.wells.${BankDIField.accountNumber}`,
      value: '0987654321',
    },
    {
      ...defaultField,
      identifier: `bank.wells.${BankDIField.routingNumber}`,
      value: '121000248',
    },
    {
      ...defaultField,
      identifier: `bank.wells.${BankDIField.accountType}`,
      value: 'savings',
    },
    {
      ...defaultField,
      identifier: `bank.wells.${BankDIField.name}`,
      value: 'Wells Fargo Savings',
    },
    {
      ...defaultField,
      identifier: `bank.wells.${BankDIField.fingerprint}`,
      value: 'wells_fingerprint_890',
    },
    {
      ...defaultField,
      identifier: `bank.bofa.${BankDIField.accountNumber}`,
      value: '5678901234',
    },
    {
      ...defaultField,
      identifier: `bank.bofa.${BankDIField.routingNumber}`,
      value: '026009593',
    },
    {
      ...defaultField,
      identifier: `bank.bofa.${BankDIField.accountType}`,
      value: 'checking',
    },
    {
      ...defaultField,
      identifier: `bank.bofa.${BankDIField.name}`,
      value: 'Bank of America Checking',
    },
    {
      ...defaultField,
      identifier: `bank.bofa.${BankDIField.fingerprint}`,
      value: 'bofa_fingerprint_123',
    },
  ],
};

export default entityFixture;
