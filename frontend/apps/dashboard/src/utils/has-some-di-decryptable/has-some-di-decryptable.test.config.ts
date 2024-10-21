import { BusinessDI, DataKind, type Entity, EntityKind, EntityStatus, IdDI } from '@onefootprint/types';

const defaultAttribute = {
  source: 'user',
  dataKind: DataKind.vaultData,
  transforms: {},
};

export const entityFixture: Entity = {
  id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
  isIdentifiable: true,
  kind: EntityKind.business,
  attributes: [],
  data: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  lastActivityAt: '2023-03-27T14:43:47.444716Z',
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
  status: EntityStatus.pass,
  decryptedAttributes: {},
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  label: null,
};

export const singleAttributeDecryptableEntity: Entity = {
  ...entityFixture,
  data: [
    { ...defaultAttribute, identifier: IdDI.email, isDecryptable: true, value: 'test@example.com' },
    { ...defaultAttribute, identifier: BusinessDI.name, isDecryptable: false, value: 'John Doe' },
  ],
};

export const multipleDecryptableAttributesEntity: Entity = {
  ...entityFixture,
  data: [
    { ...defaultAttribute, identifier: IdDI.email, isDecryptable: true, value: 'test@example.com' },
    { ...defaultAttribute, identifier: IdDI.phoneNumber, isDecryptable: true, value: '+1234567890' },
    { ...defaultAttribute, identifier: BusinessDI.name, isDecryptable: false, value: 'John Doe' },
    { ...defaultAttribute, identifier: BusinessDI.website, isDecryptable: true, value: 'https://example.com' },
  ],
};

export const noDecryptableAttributesEntity: Entity = {
  ...entityFixture,
  data: [{ ...defaultAttribute, identifier: BusinessDI.name, isDecryptable: false, value: 'Jane Doe' }],
};

export const emptyEntity: Entity = {
  ...entityFixture,
  data: [],
};
