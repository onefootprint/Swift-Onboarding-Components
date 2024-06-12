import { mockRequest } from '@onefootprint/test-utils';
import type { Entity, InsightEvent, Liveness } from '@onefootprint/types';
import { BusinessDI, EntityKind, EntityStatus, IdentifyScope, LivenessKind, LivenessSource } from '@onefootprint/types';

export const insight: InsightEvent = {
  city: 'San Francisco',
  country: 'United States',
  ipAddress: '24.3.171.149',
  latitude: 37.7703,
  longitude: -122.4407,
  metroCode: '807',
  postalCode: '94117',
  region: 'CA',
  regionName: 'California',
  timeZone: 'America/Los_Angeles',
  timestamp: '2023-05-06T00:49:44.350956Z',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
};

export const biometricCred: Liveness = {
  attributes: null,
  insight,
  source: LivenessSource.webauthnAttestation,
  linkedAttestations: [],
  kind: LivenessKind.passkey,
  scope: IdentifyScope.onboarding,
};

export const livenessDataFixture = [biometricCred];

export const withCurrentEntityAuthEventsData = () =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/auth_events',
    response: livenessDataFixture,
  });

export const withCurrentEntityAuthEventsEmpty = () =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/auth_events',
    response: [],
  });

export const withCurrentEntityAuthEventsError = () =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/auth_events',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

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
    BusinessDI.doingBusinessAs,
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
    BusinessDI.doingBusinessAs,
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
  decryptedAttributes: {
    [BusinessDI.name]: 'Acme Inc.',
  },
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  label: null,
};

export const withEntity = (entity = entityFixture) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}`,
    response: {
      ...entity,
    },
  });

export const withDocuments = (entity = entityFixture, response = []) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/documents`,
    response,
  });
