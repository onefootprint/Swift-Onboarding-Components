import {
  Entity,
  EntityKind,
  EntityStatus,
  OnboardingStatus,
  WatchlistCheckReasonCode,
  WatchlistCheckStatus,
} from '@onefootprint/types';

export const entityPassed: Entity = {
  id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
  isPortable: true,
  kind: EntityKind.person,
  attributes: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  onboarding: {
    id: 'ob_Y3gPIFuPyhqK4f9w2f8QF7',
    isAuthorized: true,
    name: '[Test] Person',
    configId: 'ob_config_id_RccCUPbZVaarmtjfNwM9vo',
    requiresManualReview: false,
    status: OnboardingStatus.pass,
    timestamp: '2023-03-27T14:43:47.446874Z',
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
    canAccessPermissions: [],
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
export const entityOnWatchlist: Entity = {
  ...entityPassed,
  watchlistCheck: {
    id: 'id',
    status: WatchlistCheckStatus.fail,
    reasonCodes: [WatchlistCheckReasonCode.watchlistHitOfac],
  },
};
