import { mockRequest } from '@onefootprint/test-utils';
import type { Organization } from '@onefootprint/types';

export const orgAllowDomainFixture: Organization = {
  allowDomainAccess: false,
  allowedPreviewApis: [],
  companySize: null,
  domains: ['footprint.com'],
  id: 'org_9242CAdpXXlDDeSmi1DQks',
  isDomainAlreadyClaimed: false,
  isProdKybPlaybookRestricted: false,
  isProdKycPlaybookRestricted: false,
  isProdAuthPlaybookRestricted: false,
  isProdNeuroEnabled: false,
  isProdSentilinkEnabled: false,
  isSandboxRestricted: false,
  logoUrl: null,
  name: 'Acme Inc',
  parent: null,
  websiteUrl: null,
};

export const orgEnabledAllowDomainAccessFixture: Organization = {
  allowDomainAccess: true,
  allowedPreviewApis: [],
  companySize: null,
  domains: ['footprint.com'],
  id: 'org_9242CAdpXXlDDeSmi1DQks',
  isDomainAlreadyClaimed: false,
  isProdKybPlaybookRestricted: false,
  isProdKycPlaybookRestricted: false,
  isProdAuthPlaybookRestricted: false,
  isProdNeuroEnabled: false,
  isProdSentilinkEnabled: false,
  isSandboxRestricted: false,
  logoUrl: null,
  name: 'Acme Inc',
  parent: null,
  websiteUrl: null,
};

export const orgDomainAlreadyClaimed: Organization = {
  allowDomainAccess: false,
  allowedPreviewApis: [],
  companySize: null,
  domains: ['footprint.com'],
  id: 'org_9242CAdpXXlDDeSmi1DQks',
  isDomainAlreadyClaimed: true,
  isProdKybPlaybookRestricted: false,
  isProdKycPlaybookRestricted: false,
  isProdAuthPlaybookRestricted: false,
  isProdNeuroEnabled: false,
  isProdSentilinkEnabled: false,
  isSandboxRestricted: false,
  logoUrl: null,
  name: 'Acme Inc',
  parent: null,
  websiteUrl: null,
};

export const withOrgUpdate = () =>
  mockRequest({
    method: 'patch',
    path: '/org',
    response: null,
  });
