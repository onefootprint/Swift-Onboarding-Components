import { getOrganization } from '@onefootprint/fixtures/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

const organizationFixture = getOrganization({});

export const withOrg = (response = organizationFixture) => {
  return mockRequest({
    method: 'get',
    path: '/org',
    response,
  });
};

export const withCreatePlaybook = () => {
  return mockRequest({
    method: 'post',
    path: '/org/playbooks',
    response: {},
  });
};
