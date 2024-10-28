import type { InsightEvent } from '@onefootprint/types';

export const insightEventFixture: InsightEvent = {
  region: 'California',
  country: 'United States',
  postalCode: '94105',
  ipAddress: '192.168.1.1',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  city: 'San Francisco',
  latitude: 37.7749,
  longitude: -122.4194,
  metroCode: '807',
  regionName: 'California',
  timeZone: 'America/Los_Angeles',
  timestamp: '2023-06-15T12:00:00Z',
};

export const partialInsightEvent: InsightEvent = {
  ...insightEventFixture,
  region: null,
  country: null,
  postalCode: null,
};

export const emptyInsightEvent: InsightEvent = {
  region: null,
  country: null,
  postalCode: null,
  ipAddress: null,
  userAgent: null,
  city: null,
  latitude: null,
  longitude: null,
  metroCode: null,
  regionName: null,
  timeZone: null,
  timestamp: '2023-06-15T12:00:00Z',
};
