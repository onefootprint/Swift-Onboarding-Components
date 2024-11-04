import { type RoleScope, RoleScopeKind } from '@onefootprint/types';
export const adminScopeFixture: RoleScope = {
  kind: RoleScopeKind.admin,
};

export const readScopeFixture: RoleScope = {
  kind: RoleScopeKind.read,
};

export const decryptScopeFixture: RoleScope = {
  kind: RoleScopeKind.decrypt,
  data: 'ssn',
};
