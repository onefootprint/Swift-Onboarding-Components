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

export const withBusinessOnboarding = () => {
  mockRequest({
    method: 'post',
    path: '/hosted/business/onboarding',
    response: {},
  });
};
