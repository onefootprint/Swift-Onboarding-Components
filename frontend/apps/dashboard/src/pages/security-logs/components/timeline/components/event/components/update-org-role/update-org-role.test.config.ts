import { AccessEventKind, RoleScopeKind, type UpdateOrgRoleDetail } from '@onefootprint/types';

export const updateOrgRoleFixture: UpdateOrgRoleDetail = {
  kind: AccessEventKind.UpdateOrgRole,
  data: {
    roleName: 'Admin',
    prevScopes: [
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
    newScopes: [
      {
        kind: RoleScopeKind.invokeVaultProxy as const,
        data: { kind: 'id', id: 'users' },
      },
    ],
    tenantRoleId: '123',
  },
};
