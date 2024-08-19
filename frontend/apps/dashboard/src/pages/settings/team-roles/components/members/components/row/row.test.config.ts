import { mockRequest } from '@onefootprint/test-utils';
import type { Member, Role } from '@onefootprint/types';
import { RoleKind, RoleScopeKind } from '@onefootprint/types';
import { asUser, resetUser } from 'src/config/tests';

export const withCurrentUserDifferentFromMember = () => {
  asUser({
    id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
    email: 'jane.doe@acme.com',
    firstName: 'Jane',
    lastName: 'Doe',
  });
};

export const withCurrentUserSameAsMember = () => {
  asUser({
    id: 'orguser_k0xUYuO2fFCwMHFPShuK77',
    email: 'jack.doe@acme.com',
    firstName: 'Jack',
    lastName: 'Doe',
  });
};

afterAll(() => {
  resetUser();
});

export const memberFixture: Member = {
  id: 'orguser_k0xUYuO2fFCwMHFPShuK77',
  email: 'jack.doe@acme.com',
  firstName: 'Jack',
  lastName: 'Doe',
  role: {
    createdAt: '2022-09-19T16:24:34.368337Z',
    id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
    isImmutable: true,
    name: 'Admin',
    numActiveUsers: 1,
    numActiveApiKeys: 0,
    scopes: [{ kind: RoleScopeKind.admin }],
    kind: RoleKind.dashboardUser,
  },
  rolebinding: {
    lastLoginAt: '2023-01-18T17:54:10.668420Z',
  },
};

export const RolesFixture: Role[] = [
  {
    id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
    name: 'Admin',
    scopes: [{ kind: RoleScopeKind.admin }],
    isImmutable: true,
    createdAt: '2022-09-19T16:24:35.367322Z',
    numActiveUsers: 1,
    numActiveApiKeys: 0,
    kind: RoleKind.dashboardUser,
  },
  {
    id: 'Role_erflKNWEF13143EWRWELJN',
    name: 'Member',
    isImmutable: true,
    scopes: [{ kind: RoleScopeKind.read }],
    createdAt: '2023-01-06T05:11:08.415924Z',
    numActiveUsers: 4,
    numActiveApiKeys: 0,
    kind: RoleKind.dashboardUser,
  },
];

export const roleToSelectOnEdit = RolesFixture.find(role => role.name === 'Member') as Role;

export const withRoles = (Roles: Role[] = RolesFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/roles',
    response: {
      data: Roles,
      meta: {
        next: null,
        count: null,
      },
    },
  });

export const withEditMember = (member: Member, newRole: Role) =>
  mockRequest({
    method: 'patch',
    path: `/org/members/${member.id}`,
    response: {
      ...member,
      roleId: newRole.id,
      roleName: newRole.name,
    },
  });
