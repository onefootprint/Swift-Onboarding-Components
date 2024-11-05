import { getOrganization } from '@onefootprint/fixtures/dashboard';
import type { Organization } from '@onefootprint/request-types/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

export const organizationFixture = getOrganization({
  id: 'org_9L42CAdpXhDeSmi1DI8Qks',
  name: 'Acme',
  logoUrl: 'https://acme.com/logo.png',
  supportEmail: 'support@acme.com',
  supportPhone: '123-456-7890',
  supportWebsite: 'https://support.acme.com',
  websiteUrl: 'https://acme.com',
});

export const organizationDataLabels = [
  'Company name',
  'Website',
  'Organization ID',
  'Support email',
  'Support phone',
  'Support website',
];

export const updatedOrgData = {
  name: 'New Organization Name',
  websiteUrl: 'https://newwebsite.com',
  supportEmail: 'newsupport@example.com',
  supportPhone: '+9876543210',
  supportWebsite: 'https://newsupport.example.com',
};

export const visibleOrganizationFixtureData = [
  organizationFixture.name,
  organizationFixture.websiteUrl,
  organizationFixture.supportEmail,
  organizationFixture.supportPhone,
  organizationFixture.id,
  organizationFixture.supportWebsite,
];

export const withOrganization = (organization?: Partial<Organization>) =>
  mockRequest({
    method: 'get',
    path: '/org',
    response: {
      ...organizationFixture,
      ...organization,
    },
  });

export const withOrganizationError = () =>
  mockRequest({
    method: 'get',
    path: '/org',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withUpdateOrg = (newOrg: Partial<Organization>) =>
  mockRequest({
    method: 'patch',
    path: '/org',
    response: {
      ...organizationFixture,
      ...newOrg,
    },
  });

export const withUpdateOrgError = () =>
  mockRequest({
    method: 'patch',
    path: '/org',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
