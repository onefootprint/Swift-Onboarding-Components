import type { TenantScope } from '@onefootprint/request-types/dashboard';

export const roleFixture = {
  roleName: 'string',
  prevScopes: [
    {
      kind: 'decrypt' as const,
      data: 'name' as const,
    },
  ] as TenantScope[],
  newScopes: [
    {
      kind: 'decrypt' as const,
      data: 'name' as const,
    },
  ] as TenantScope[],
  tenantRoleId: 'string',
};
