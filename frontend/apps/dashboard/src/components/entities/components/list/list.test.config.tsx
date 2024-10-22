import { mockRequest } from '@onefootprint/test-utils';
import type { Entity } from '@onefootprint/types';
import { BusinessDI, DataKind, EntityKind, EntityStatus } from '@onefootprint/types';

const defaultAttribute = {
  source: 'user',
  dataKind: DataKind.vaultData,
  transforms: {},
};

export const entitiesFixture: Entity[] = [
  {
    id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
    isIdentifiable: true,
    kind: EntityKind.business,
    data: [
      { ...defaultAttribute, identifier: BusinessDI.city, isDecryptable: true, value: null },
      { ...defaultAttribute, identifier: BusinessDI.name, isDecryptable: true, value: 'Acme Inc.' },
      { ...defaultAttribute, identifier: BusinessDI.website, isDecryptable: true, value: null },
      { ...defaultAttribute, identifier: BusinessDI.addressLine1, isDecryptable: true, value: null },
      { ...defaultAttribute, identifier: BusinessDI.phoneNumber, isDecryptable: true, value: null },
      { ...defaultAttribute, identifier: BusinessDI.zip, isDecryptable: true, value: null },
      { ...defaultAttribute, identifier: BusinessDI.country, isDecryptable: true, value: null },
      { ...defaultAttribute, identifier: BusinessDI.state, isDecryptable: true, value: null },
      { ...defaultAttribute, identifier: BusinessDI.tin, isDecryptable: true, value: null },
    ],
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
    watchlistCheck: null,
    hasOutstandingWorkflowRequest: false,
    label: null,
  },
];

export const withEntities = (response: Entity[] = entitiesFixture) =>
  mockRequest({
    method: 'post',
    path: '/entities/search',
    response: {
      data: response,
      meta: {},
    },
  });

export const withEntitiesError = () =>
  mockRequest({
    method: 'post',
    path: '/entities/search',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
