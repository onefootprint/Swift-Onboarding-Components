import { AccessEventKind, ActorKind } from '@onefootprint/types';

export const decryptUserDataFixture = {
  id: 'test-id',
  tenantId: 'test-tenant-id',
  name: AccessEventKind.DecryptUserData,
  detail: {
    kind: AccessEventKind.DecryptUserData,
    data: {
      fpId: '123',
      reason: 'Test reason',
      decryptedFields: [],
    },
  },
  timestamp: '2023-01-01T00:00:00Z',
  principal: {
    kind: ActorKind.apiKey as const,
    fpId: '123',
    id: '1234',
    name: 'Test API Key',
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

export const createOrgApiKeyFixture = {
  ...decryptUserDataFixture,
  name: AccessEventKind.CreateOrgApiKey,
  detail: {
    kind: AccessEventKind.CreateOrgApiKey,
    data: {
      fpId: '123',
      reason: 'User logged in',
      decryptedFields: [],
    },
  },
};
