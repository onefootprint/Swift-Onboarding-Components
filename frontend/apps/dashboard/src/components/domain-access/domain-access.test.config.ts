import { getOrganization } from '@onefootprint/fixtures/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

export const orgAllowDomainFixture = getOrganization({
  allowDomainAccess: false,
});

export const orgEnabledAllowDomainAccessFixture = getOrganization({
  allowDomainAccess: true,
});

export const orgDomainAlreadyClaimed = getOrganization({
  allowDomainAccess: false,
  isDomainAlreadyClaimed: true,
  domains: ['footprint.com'],
});

export const withOrgUpdate = () => {
  return mockRequest({
    method: 'patch',
    path: '/org',
    response: null,
  });
};
