import { mockRequest } from '@onefootprint/test-utils';
import type { Member, Role } from '@onefootprint/types';
import { RoleKind, RoleScopeKind } from '@onefootprint/types';
import { asUser, resetUser } from 'src/config/tests';

beforeEach(() => {
  asUser({
    id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
    email: 'jane.doe@acme.com',
    firstName: 'Jane',
    lastName: 'Doe',
  });
});

afterAll(() => {
  resetUser();
});

export const membersFixture: Member[] = [
  {
    id: 'orguser_IJNDrl9WcqJi28ZUnpMlVO',
    email: 'jane.doe@acme.com',
    firstName: 'Jane',
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
  },
  {
    id: 'orguser_k0yUYuO2fFCwMHFPShuK77',
    email: 'ayrton@acme.com',
    firstName: 'Ayrton',
    lastName: 'Larson',
    role: {
      createdAt: '2022-09-19T16:24:34.368337Z',
      id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Member',
      numActiveUsers: 5,
      numActiveApiKeys: 0,
      scopes: [{ kind: RoleScopeKind.read }],
      kind: RoleKind.dashboardUser,
    },
    rolebinding: {
      lastLoginAt: '2023-01-19T13:02:16.268743Z',
    },
  },
  {
    id: 'orguser_1htKM3mwSfU6o5OIoXaSGO',
    email: 'gianluca@acme.com',
    firstName: 'Gianluca',
    lastName: 'Gilmore',
    role: {
      createdAt: '2022-09-19T16:24:34.368337Z',
      id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Member',
      numActiveUsers: 5,
      numActiveApiKeys: 0,
      scopes: [{ kind: RoleScopeKind.read }],
      kind: RoleKind.dashboardUser,
    },
    rolebinding: {
      lastLoginAt: '2023-01-17T20:14:10.836665Z',
    },
  },
  {
    id: 'orguser_yTpSomOQgspCRDrdPfVpLN',
    email: 'rosie@acme.com',
    firstName: 'Rosie',
    lastName: 'Jennings',
    role: {
      createdAt: '2022-09-19T16:24:34.368337Z',
      id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Member',
      numActiveUsers: 5,
      numActiveApiKeys: 0,
      scopes: [{ kind: RoleScopeKind.read }],
      kind: RoleKind.dashboardUser,
    },
    rolebinding: {
      lastLoginAt: '2023-01-19T00:25:39.500544Z',
    },
  },
  {
    id: 'orguser_HxUwoIsqyOuiWrfElXSsOV',
    email: 'teddy@acme.com',
    firstName: 'Teddy',
    lastName: 'Velez',
    role: {
      createdAt: '2022-09-19T16:24:34.368337Z',
      id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Member',
      numActiveUsers: 5,
      numActiveApiKeys: 0,
      scopes: [{ kind: RoleScopeKind.read }],
      kind: RoleKind.dashboardUser,
    },
    rolebinding: {
      lastLoginAt: '2023-01-13T12:57:00.098715Z',
    },
  },
  {
    id: 'orguser_KJ6uPe6jjs2STG7BAdvznx',
    email: 'felix@acme.com',
    firstName: 'Felix',
    lastName: 'Tate',
    role: {
      createdAt: '2022-09-19T16:24:34.368337Z',
      id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Member',
      numActiveUsers: 5,
      numActiveApiKeys: 0,
      scopes: [{ kind: RoleScopeKind.read }],
      kind: RoleKind.dashboardUser,
    },
    rolebinding: {
      lastLoginAt: '2023-01-12T20:37:52.240432Z',
    },
  },
];

export const membersRelativeTimeFixture = [
  '20 hours ago',
  '1 hour ago',
  '2 days ago',
  '14 hours ago',
  '6 days ago',
  '7 days ago',
];

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
    numActiveUsers: 5,
    numActiveApiKeys: 0,
    kind: RoleKind.dashboardUser,
  },
  {
    id: 'Role_bX2flKNWEF13143EWRWELJN',
    name: 'Developer',
    isImmutable: true,
    scopes: [{ kind: RoleScopeKind.apiKeys }],
    createdAt: '2023-01-06T05:11:08.415924Z',
    numActiveUsers: 0,
    numActiveApiKeys: 1,
    kind: RoleKind.dashboardUser,
  },
];

export const memberToEdit = membersFixture.find(member => member.email === 'jane.doe@acme.com') as Member;

export const memberToEditRole = RolesFixture.find(role => role.name === 'Developer') as Role;

export const withMembers = (members: Member[] = membersFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/members',
    response: {
      data: members,
      meta: {
        next: null,
        count: null,
      },
    },
  });

export const withMembersError = () =>
  mockRequest({
    method: 'get',
    path: '/org/members',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withCreateMembers = () =>
  mockRequest({
    method: 'post',
    path: '/org/members',
    response: null,
  });

export const withCreateMembersError = () =>
  mockRequest({
    method: 'post',
    path: '/org/members',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
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

export const withEditMemberError = (member: Member) =>
  mockRequest({
    method: 'patch',
    path: `/org/members/${member.id}`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withRemoveMember = (id: string) =>
  mockRequest({
    method: 'post',
    path: `/org/members/${id}/deactivate`,
    response: null,
  });

export const withRemoveMemberError = (id: string) =>
  mockRequest({
    method: 'post',
    path: `/org/members/${id}/deactivate`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

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

export const withRolesError = () =>
  mockRequest({
    method: 'get',
    path: '/org/roles',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
