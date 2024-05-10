import { mockRequest } from '@onefootprint/test-utils';
import type { InsightEvent, Liveness } from '@onefootprint/types';
import {
  IdentifyScope,
  LivenessKind,
  LivenessSource,
} from '@onefootprint/types';

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
      error: {
        message: 'Something went wrong',
      },
    },
  });
