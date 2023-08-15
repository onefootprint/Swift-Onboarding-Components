import {
  Entity,
  EntityKind,
  EntityStatus,
  WatchlistCheckReasonCode,
  WatchlistCheckStatus,
} from '@onefootprint/types';

export const entityPassed: Entity = {
  id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
  isPortable: true,
  kind: EntityKind.person,
  attributes: [],
  decryptableAttributes: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  insightEvent: {
    timestamp: '2023-03-29T23:07:46.850237Z',
    ipAddress: '73.222.157.30',
    city: 'San Francisco',
    country: 'United States',
    region: 'CA',
    regionName: 'California',
    latitude: 37.7595,
    longitude: -122.4367,
    metroCode: '807',
    postalCode: '94114',
    timeZone: 'America/Los_Angeles',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
  },
  requiresManualReview: false,
  status: EntityStatus.pass,
  decryptedAttributes: {},
  watchlistCheck: null,
};

export const entityFailed: Entity = {
  ...entityPassed,
  status: EntityStatus.failed,
};
export const entityIncomplete: Entity = {
  ...entityPassed,
  status: EntityStatus.incomplete,
};

export const entityVaultOnly: Entity = {
  ...entityPassed,
  status: EntityStatus.none,
};

export const entityOnWatchlist: Entity = {
  ...entityPassed,
  watchlistCheck: {
    id: 'id',
    status: WatchlistCheckStatus.fail,
    reasonCodes: [WatchlistCheckReasonCode.watchlistHitOfac],
  },
};
