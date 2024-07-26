import { mockRequest } from '@onefootprint/test-utils';
import type { Organization } from '@onefootprint/types';

export const orgAllowDomainFixture: Organization = {
  id: 'org_9242CAdpXXlDDeSmi1DQks',
  name: 'Acme Inc',
  logoUrl: null,
  isSandboxRestricted: false,
  websiteUrl: null,
  companySize: null,
  domains: ['footprint.com'],
  allowDomainAccess: false,
  isDomainAlreadyClaimed: false,
  isProdKybPlaybookRestricted: false,
  isProdKycPlaybookRestricted: false,
  parent: null,
  allowedPreviewApis: [],
};

export const orgEnabledAllowDomainAccessFixture: Organization = {
  id: 'org_9242CAdpXXlDDeSmi1DQks',
  name: 'Acme Inc',
  logoUrl: null,
  isSandboxRestricted: false,
  websiteUrl: null,
  companySize: null,
  domains: ['footprint.com'],
  allowDomainAccess: true,
  isDomainAlreadyClaimed: false,
  isProdKybPlaybookRestricted: false,
  isProdKycPlaybookRestricted: false,
  parent: null,
  allowedPreviewApis: [],
};

export const orgDomainAlreadyClaimed: Organization = {
  id: 'org_9242CAdpXXlDDeSmi1DQks',
  name: 'Acme Inc',
  logoUrl: null,
  isSandboxRestricted: false,
  websiteUrl: null,
  companySize: null,
  domains: ['footprint.com'],
  allowDomainAccess: false,
  isDomainAlreadyClaimed: true,
  isProdKybPlaybookRestricted: false,
  isProdKycPlaybookRestricted: false,
  parent: null,
  allowedPreviewApis: [],
};

export const withOrgUpdate = () =>
  mockRequest({
    method: 'patch',
    path: '/org',
    response: null,
  });
