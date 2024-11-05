import { AccessEventKind, type DeactivateOrgRoleDetail, RoleScopeKind } from '@onefootprint/types';

export const deactivateOrgRoleFixture: DeactivateOrgRoleDetail = {
  kind: AccessEventKind.DeactivateOrgRole,
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
  },
};
