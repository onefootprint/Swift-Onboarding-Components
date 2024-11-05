import { AccessEventKind, type CreateOrgRoleDetail, RoleScopeKind } from '@onefootprint/types';

export const createOrgRoleFixture: CreateOrgRoleDetail = {
  kind: AccessEventKind.CreateOrgRole,
  data: {
    roleName: 'Admin',
    scopes: [
      {
        kind: RoleScopeKind.invokeVaultProxy as const,
        data: {
          kind: 'id',
          id: 'users',
        },
      },
      {
        kind: RoleScopeKind.invokeVaultProxy as const,
        data: {
          kind: 'id',
          id: 'users',
        },
      },
    ],
    tenantRoleId: '123',
  },
};
