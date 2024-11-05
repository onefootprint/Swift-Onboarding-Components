import { getOrganization } from '@onefootprint/fixtures/dashboard';
import type { Organization } from '@onefootprint/request-types/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

export const orgFixture = getOrganization({
  id: 'org_9242CAdpXXlDDeSmi1DQks',
  name: 'Acme Inc',
});

export const withOrg = (response = orgFixture) => {
  return mockRequest({
    method: 'get',
    path: '/org',
    response,
  });
};

export const withOrgError = () => {
  return mockRequest({
    method: 'get',
    path: '/org',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
};

export const withUpdateOrg = (response: Partial<Organization>) => {
  return mockRequest({
    method: 'patch',
    path: '/org',
    response,
  });
};

export const withUpdateOrgError = () => {
  return mockRequest({
    method: 'patch',
    path: '/org',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
};
