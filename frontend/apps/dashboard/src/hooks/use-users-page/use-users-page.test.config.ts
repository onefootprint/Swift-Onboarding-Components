import { mockRequest } from '@onefootprint/test-utils';
import { OnboardingStatus, ScopedUser } from '@onefootprint/types';

export const metadataPageFixture: ScopedUser[] = [
  {
    id: 'u1',
    isPortable: true,
    identityDataAttributes: [],
    identityDocumentTypes: [],
    startTimestamp: 'time',
    orderingId: 'id',
    onboarding: {
      id: 'id',
      name: 'name',
      configId: 'id',
      requiresManualReview: false,
      status: OnboardingStatus.verified,
      timestamp: 'time',
      isLivenessSkipped: false,
      insightEvent: {
        timestamp: 'time',
      },
      canAccessData: [],
      canAccessDataAttributes: [],
      canAccessIdentityDocumentImages: false,
    },
  },
  {
    id: 'u2',
    isPortable: true,
    identityDataAttributes: [],
    identityDocumentTypes: [],
    startTimestamp: 'time',
    orderingId: 'id',
    onboarding: {
      id: 'id',
      name: 'name',
      configId: 'id',
      requiresManualReview: true,
      status: OnboardingStatus.failed,
      timestamp: 'time',
      isLivenessSkipped: false,
      insightEvent: {
        timestamp: 'time',
      },
      canAccessData: [],
      canAccessDataAttributes: [],
      canAccessIdentityDocumentImages: false,
    },
  },
  {
    id: 'u3',
    isPortable: true,
    identityDataAttributes: [],
    identityDocumentTypes: [],
    startTimestamp: 'time',
    orderingId: 'id',
  },
];

export const withMetadataPage = () =>
  mockRequest({
    method: 'get',
    path: '/users',
    response: {
      data: metadataPageFixture,
      meta: {
        next: 'next',
        count: 3,
      },
    },
  });
