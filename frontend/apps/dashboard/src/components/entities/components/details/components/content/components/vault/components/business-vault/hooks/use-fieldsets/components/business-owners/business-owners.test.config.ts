import { mockRequest } from '@onefootprint/test-utils';
import type { Entity } from '@onefootprint/types';
import { BusinessDI, EntityKind, EntityStatus } from '@onefootprint/types';

export const entityFixture: Entity = {
  id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
  isIdentifiable: true,
  kind: EntityKind.business,
  attributes: [
    BusinessDI.addressLine1,
    BusinessDI.beneficialOwners,
    BusinessDI.city,
    BusinessDI.country,
    BusinessDI.name,
    BusinessDI.phoneNumber,
    BusinessDI.state,
    BusinessDI.tin,
    BusinessDI.tin,
    BusinessDI.website,
    BusinessDI.zip,
  ],
  decryptableAttributes: [
    BusinessDI.addressLine1,
    BusinessDI.beneficialOwners,
    BusinessDI.city,
    BusinessDI.country,
    BusinessDI.name,
    BusinessDI.phoneNumber,
    BusinessDI.state,
    BusinessDI.tin,
    BusinessDI.tin,
    BusinessDI.website,
    BusinessDI.zip,
  ],
  data: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  lastActivityAt: '2023-03-27T14:43:47.444716Z',
  decryptedAttributes: {
    [BusinessDI.name]: 'Acme Inc.',
  },
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
      error: {
        message: 'Something went wrong',
      },
    },
  });
