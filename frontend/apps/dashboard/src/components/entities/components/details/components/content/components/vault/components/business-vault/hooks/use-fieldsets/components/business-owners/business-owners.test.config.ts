import { mockRequest } from '@onefootprint/test-utils';
import type { Entity } from '@onefootprint/types';
import { BusinessDI, DataKind, EntityKind, EntityStatus } from '@onefootprint/types';

const defaultAttribute = {
  source: 'user',
  dataKind: DataKind.vaultData,
  transforms: {},
};

export const entityFixture: Entity = {
  id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
  isIdentifiable: true,
  kind: EntityKind.business,
  data: [
    { ...defaultAttribute, identifier: BusinessDI.addressLine1, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.city, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.country, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.name, isDecryptable: true, value: 'Acme Inc.' },
    { ...defaultAttribute, identifier: BusinessDI.phoneNumber, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.state, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.tin, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.website, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.zip, isDecryptable: true, value: null },
    {
      ...defaultAttribute,
      identifier: BusinessDI.beneficialOwnerExplanationMessage,
      isDecryptable: true,
      value:
        "The other 5% is split among 10 small angel investors, so I didn't think it was relevant to add them all here.",
    },
  ],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  lastActivityAt: '2023-03-27T14:43:47.444716Z',
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  requiresManualReview: false,
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
  label: null,
};

export const withBusinessOwnersError = (entity = entityFixture) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/business_owners`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withBusinessOwners = (entity = entityFixture) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/business_owners`,
    statusCode: 200,
    response: [
      {
        fpId: 'fp_id_test_4Cuir5AKf9Hdaxyjay3fMZ',
        status: 'incomplete',
        ownershipStake: 24,
        ownershipStakeDi: 'business.beneficial_owners.bo_link_primary.ownership_stake',
        kind: 'primary',
        source: 'hosted',
        name: 'John Smith',
      },
      {
        fpId: 'fp_id_test_5Duir6BLg0Iebxzkbz4gNa',
        status: 'incomplete',
        ownershipStake: 35,
        ownershipStakeDi: 'business.beneficial_owners.bo_link_primary.ownership_stake',
        kind: 'secondary',
        source: 'hosted',
        name: 'Sarah Johnson',
      },
      {
        fpId: 'fp_id_test_6Euir7CMh1Jfcyalc05hOb',
        status: 'incomplete',
        ownershipStake: 41,
        ownershipStakeDi: 'business.beneficial_owners.bo_link_primary.ownership_stake',
        kind: 'secondary',
        source: 'hosted',
        name: 'Michael Brown',
      },
    ],
  });
