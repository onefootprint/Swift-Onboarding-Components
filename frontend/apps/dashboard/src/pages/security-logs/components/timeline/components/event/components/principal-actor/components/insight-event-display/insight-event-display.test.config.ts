import { getInsightEvent } from '@onefootprint/fixtures/dashboard';
import type { InsightEvent } from '@onefootprint/request-types/dashboard';

export const insightEventFixture: InsightEvent = getInsightEvent({});

export const partialInsightEvent: InsightEvent = {
  ...insightEventFixture,
  region: undefined,
  country: undefined,
  postalCode: undefined,
};

export const emptyInsightEvent: InsightEvent = {
  region: undefined,
  country: undefined,
  postalCode: undefined,
  ipAddress: undefined,
  userAgent: undefined,
  city: undefined,
  latitude: undefined,
  longitude: undefined,
  metroCode: undefined,
  regionName: undefined,
  timeZone: undefined,
  timestamp: '2023-06-15T12:00:00Z',
};
