import { AccessEventKind, ActorKind, IdDI } from '@onefootprint/types';

export const decryptEventFixture = {
  id: 'test-id',
  tenantId: 'test-tenant-id',
  name: AccessEventKind.DecryptUserData,
  detail: {
    kind: AccessEventKind.DecryptUserData,
    data: {
      fpId: '123',
      reason: 'User logged in',
      decryptedFields: [IdDI.firstName, IdDI.lastName],
    },
  },
  timestamp: '2023-01-01T00:00:00Z',
  principal: {
    kind: ActorKind.apiKey as const,
    fpId: '123',
    id: '123',
    name: 'Test User',
  },
  insightEvent: {
    city: 'San Francisco',
    country: 'US',
    ipAddress: '127.0.0.1',
    latitude: 37.7749,
    longitude: -122.4194,
    metroCode: 'SF',
    postalCode: '94105',
    region: 'CA',
    regionName: 'California',
    timeZone: 'America/Los_Angeles',
    userAgent: 'Mozilla/5.0',
    timestamp: '2023-01-01T00:00:00Z',
    sessionId: 'abc123',
  },
};

export const nonDecryptEventFixture = {
  id: 'test-id-2',
  tenantId: 'test-tenant-id',
  name: AccessEventKind.CreateOrgApiKey,
  detail: {
    kind: AccessEventKind.CreateOrgApiKey,
    data: {},
  },
  timestamp: '2023-01-01T00:00:00Z',
  principal: {
    kind: ActorKind.user as const,
    fpId: '123',
    id: '123',
    name: 'Test User',
  },
  insightEvent: {
    city: 'San Francisco',
    country: 'US',
    ipAddress: '127.0.0.1',
    latitude: 37.7749,
    longitude: -122.4194,
    metroCode: 'SF',
    postalCode: '94105',
    region: 'CA',
    regionName: 'California',
    timeZone: 'America/Los_Angeles',
    userAgent: 'Mozilla/5.0',
    timestamp: '2023-01-01T00:00:00Z',
    sessionId: 'abc123',
  },
};
