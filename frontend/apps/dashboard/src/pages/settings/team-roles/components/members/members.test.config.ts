import { getOrganizationMember, getOrganizationRole } from '@onefootprint/fixtures/dashboard';
import type { OrganizationMember, OrganizationRole } from '@onefootprint/request-types/dashboard';
import { mockRequest } from '@onefootprint/test-utils';
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

export const membersFixture: OrganizationMember[] = [
  getOrganizationMember({
    id: 'orguser_IJNDrl9WcqJi28ZUnpMlVO',
    email: 'jane.doe@acme.com',
    firstName: 'Jane',
    lastName: 'Doe',
    rolebinding: {
      lastLoginAt: '2023-01-18T17:54:10.668420Z',
    },
  }),
  getOrganizationMember({
    id: 'orguser_k0yUYuO2fFCwMHFPShuK77',
    email: 'ayrton@acme.com',
    firstName: 'Ayrton',
    lastName: 'Larson',
    rolebinding: {
      lastLoginAt: '2023-01-19T13:02:16.268743Z',
    },
  }),
  getOrganizationMember({
    id: 'orguser_1htKM3mwSfU6o5OIoXaSGO',
    email: 'gianluca@acme.com',
    firstName: 'Gianluca',
    lastName: 'Gilmore',
    rolebinding: {
      lastLoginAt: '2023-01-17T20:14:10.836665Z',
    },
  }),
  getOrganizationMember({
    id: 'orguser_yTpSomOQgspCRDrdPfVpLN',
    email: 'rosie@acme.com',
    firstName: 'Rosie',
    lastName: 'Jennings',
    rolebinding: {
      lastLoginAt: '2023-01-19T00:25:39.500544Z',
    },
  }),
  getOrganizationMember({
    id: 'orguser_HxUwoIsqyOuiWrfElXSsOV',
    email: 'teddy@acme.com',
    firstName: 'Teddy',
    lastName: 'Velez',
    rolebinding: {
      lastLoginAt: '2023-01-13T12:57:00.098715Z',
    },
  }),
  getOrganizationMember({
    id: 'orguser_KJ6uPe6jjs2STG7BAdvznx',
    email: 'felix@acme.com',
    firstName: 'Felix',
    lastName: 'Tate',
    rolebinding: {
      lastLoginAt: '2023-01-12T20:37:52.240432Z',
    },
  }),
];

export const membersRelativeTimeFixture = [
  '20 hours ago',
  '1 hour ago',
  '2 days ago',
  '14 hours ago',
  '6 days ago',
  '7 days ago',
];

export const RolesFixture: OrganizationRole[] = [
  getOrganizationRole({
    id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
    name: 'Admin',
    scopes: [
      {
        kind: 'admin',
      },
    ],
  }),
  getOrganizationRole({
    id: 'Role_erflKNWEF13143EWRWELJN',
    name: 'Member',
    scopes: [{ kind: 'read' }],
  }),
  getOrganizationRole({
    id: 'Role_bX2flKNWEF13143EWRWELJN',
    name: 'Developer',
    scopes: [{ kind: 'api_keys' }],
  }),
];

export const memberToEdit = membersFixture.find(member => member.email === 'jane.doe@acme.com') as OrganizationMember;

export const memberToEditRole = RolesFixture.find(role => role.name === 'Developer') as OrganizationRole;

export const withMembers = (members: OrganizationMember[] = membersFixture) =>
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
      message: 'Something went wrong',
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
      message: 'Something went wrong',
    },
  });

export const withEditMember = (member: OrganizationMember, newRole: OrganizationRole) =>
  mockRequest({
    method: 'patch',
    path: `/org/members/${member.id}`,
    response: {
      ...member,
      roleId: newRole.id,
      roleName: newRole.name,
    },
  });

export const withEditMemberError = (member: OrganizationMember) =>
  mockRequest({
    method: 'patch',
    path: `/org/members/${member.id}`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
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
      message: 'Something went wrong',
    },
  });

export const withRoles = (Roles: OrganizationRole[] = RolesFixture) =>
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
      message: 'Something went wrong',
    },
  });
