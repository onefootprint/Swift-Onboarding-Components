import { mockRequest } from '@onefootprint/test-utils';

export const withNoBusinesses = () => {
  mockRequest({
    method: 'get',
    path: '/hosted/businesses',
    response: [],
  });
};

export const withBusinesses = () => {
  mockRequest({
    method: 'get',
    path: '/hosted/businesses',
    response: [
      {
        id: 'bo_umNDN0eBoo4tVLdjdY6END',
        name: 'Acme Bank',
        createdAt: '2024-10-29T13:17:52.149763Z',
        lastActivityAt: '2024-02-17T08:12:55.789Z',
        isIncomplete: true,
      },
    ],
  });
};

export const withBusinessOwners = () => {
  mockRequest({
    method: 'get',
    path: '/hosted/business/owners',
    response: [
      {
        linkId: 'bo_link_primary',
        uuid: 'f54f4444-ad52-4844-8ad5-2d9f47a765fa',
        hasLinkedUser: true,
        isAuthedUser: true,
        isMutable: true,
        decryptedData: {
          'id.last_name': 'KYB',
          'id.phone_number': '+15555550100',
          'id.first_name': 'Skip',
          'id.email': 'sandbox@onefootprint.com',
        },
        populatedData: ['id.email', 'id.first_name', 'id.last_name', 'id.phone_number'],
        ownershipStake: null,
        createdAt: '2024-10-30T17:16:37.180834Z',
      },
    ],
  });
};

export const withBusinessOnboarding = () => {
  mockRequest({
    method: 'post',
    path: '/hosted/business/onboarding',
    response: {},
  });
};

export const withBusinessUpdate = () => {
  mockRequest({
    method: 'patch',
    path: '/hosted/business/vault',
    response: {},
  });
};
