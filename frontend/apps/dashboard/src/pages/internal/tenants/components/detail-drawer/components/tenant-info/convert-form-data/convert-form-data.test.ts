import type { TenantDetail } from '@onefootprint/types';

import type { UpdateTenantFormData } from './convert-form-data';
import { convertFormData } from './convert-form-data';

describe('convertFormData', () => {
  it.each([
    {
      data: {
        name: 'Name',
        superTenantId: 'org_x',
        isDemoTenant: false,
        domains: 'a.com,b.com',
        allowDomainAccess: true,
        supportedAuthMethods: [],
        allowedPreviewApis: [
          {
            label: 'api_1',
            value: 'api_1',
          },
          {
            label: 'api_2',
            value: 'api_2',
          },
        ],
        notSandboxRestricted: true,
        notIsProdKycPlaybookRestricted: true,
        notIsProdKybPlaybookRestricted: true,
        notIsProdAuthPlaybookRestricted: true,
      },
      tenant: {
        name: 'Name',
        superTenantId: 'org_x',
        isDemoTenant: false,
        domains: ['a.com', 'b.com'],
        allowDomainAccess: true,
        supportedAuthMethods: undefined,
        allowedPreviewApis: ['api_2', 'api_1'],
        sandboxRestricted: false,
        isProdKycPlaybookRestricted: false,
        isProdKybPlaybookRestricted: false,
        isProdAuthPlaybookRestricted: false,
      },
      x: {
        name: undefined,
        superTenantId: undefined,
        isDemoTenant: undefined,
        domains: undefined,
        allowDomainAccess: undefined,
        supportedAuthMethods: undefined,
        allowedPreviewApis: undefined,
        sandboxRestricted: undefined,
        isProdKycPlaybookRestricted: undefined,
        isProdKybPlaybookRestricted: undefined,
        isProdAuthPlaybookRestricted: undefined,
      },
    },
    {
      data: {
        name: 'Name2',
        superTenantId: 'org_x',
        isDemoTenant: true,
        domains: 'a.com,c.com',
        allowDomainAccess: true,
        supportedAuthMethods: [
          {
            label: 'google_oauth',
            value: 'google_oauth',
          },
        ],
        allowedPreviewApis: [
          {
            label: 'api_1',
            value: 'api_1',
          },
          {
            label: 'api_2',
            value: 'api_2',
          },
        ],
        notSandboxRestricted: true,
        notIsProdKycPlaybookRestricted: true,
        notIsProdKybPlaybookRestricted: true,
        notIsProdAuthPlaybookRestricted: true,
      },
      tenant: {
        name: 'Name',
        superTenantId: undefined,
        isDemoTenant: false,
        domains: ['a.com', 'b.com'],
        allowDomainAccess: false,
        supportedAuthMethods: undefined,
        allowedPreviewApis: ['api_1'],
        sandboxRestricted: true,
        isProdKycPlaybookRestricted: true,
        isProdKybPlaybookRestricted: true,
        isProdAuthPlaybookRestricted: true,
      },
      x: {
        name: 'Name2',
        superTenantId: 'org_x',
        isDemoTenant: true,
        domains: ['a.com', 'c.com'],
        allowDomainAccess: true,
        supportedAuthMethods: ['google_oauth'],
        allowedPreviewApis: ['api_1', 'api_2'],
        sandboxRestricted: false,
        isProdKycPlaybookRestricted: false,
        isProdKybPlaybookRestricted: false,
        isProdAuthPlaybookRestricted: false,
      },
    },
    // Can clear some fields
    {
      data: {
        supportedAuthMethods: [],
        superTenantId: '',
        // Unchanged
        name: 'Name',
        isDemoTenant: false,
        domains: 'a.com,b.com',
        allowDomainAccess: false,
        allowedPreviewApis: [],
        notSandboxRestricted: true,
        notIsProdKycPlaybookRestricted: true,
        notIsProdKybPlaybookRestricted: true,
        notIsProdAuthPlaybookRestricted: true,
      },
      tenant: {
        supportedAuthMethods: ['google_oauth'],
        superTenantId: 'org_xxx',
        // Unchanged
        name: 'Name',
        isDemoTenant: false,
        domains: ['a.com', 'b.com'],
        allowDomainAccess: false,
        allowedPreviewApis: [],
        sandboxRestricted: false,
        isProdKycPlaybookRestricted: false,
        isProdKybPlaybookRestricted: false,
        isProdAuthPlaybookRestricted: false,
      },
      x: {
        superTenantId: null,
        supportedAuthMethods: null,
        name: undefined,
        isDemoTenant: undefined,
        domains: undefined,
        allowDomainAccess: undefined,
        allowedPreviewApis: undefined,
        sandboxRestricted: undefined,
        isProdKycPlaybookRestricted: undefined,
        isProdKybPlaybookRestricted: undefined,
        isProdAuthPlaybookRestricted: undefined,
      },
    },
  ])('.', ({ data, tenant, x }) => {
    expect(convertFormData(tenant as unknown as TenantDetail, data as unknown as UpdateTenantFormData)).toStrictEqual(
      x,
    );
  });
});
