import { mockRequest } from '@onefootprint/test-utils';
import { OrgMember, OrgRole, OrgRoleScope } from '@onefootprint/types';
import { useStore } from 'src/hooks/use-session';

const originalState = useStore.getState();

beforeEach(() => {
  useStore.setState({
    data: {
      auth: '1',
      user: {
        id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
        email: 'jane.doe@acme.com',
        firstName: 'Jane',
        lastName: 'Doe',
      },
      org: {
        isLive: false,
        logoUrl: null,
        name: 'Acme',
        isSandboxRestricted: true,
      },
    },
  });
});

afterAll(() => {
  useStore.setState(originalState);
});

export const orgMembersFixture: OrgMember[] = [
  {
    id: 'orguser_IJNDrl9WcqJi28ZUnpMlVO',
    email: 'jane.doe@acme.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: {
      createdAt: '2022-09-19T16:24:34.368337Z',
      id: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Admin',
      numActiveUsers: 1,
      scopes: ['admin' as OrgRoleScope],
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
      id: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Member',
      numActiveUsers: 5,
      scopes: ['read' as OrgRoleScope],
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
      id: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Member',
      numActiveUsers: 5,
      scopes: ['read' as OrgRoleScope],
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
      id: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Member',
      numActiveUsers: 5,
      scopes: ['read' as OrgRoleScope],
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
      id: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Member',
      numActiveUsers: 5,
      scopes: ['read' as OrgRoleScope],
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
      id: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Member',
      numActiveUsers: 5,
      scopes: ['read' as OrgRoleScope],
    },
    rolebinding: {
      lastLoginAt: '2023-01-12T20:37:52.240432Z',
    },
  },
];

export const orgMembersRelativeTimeFixture = [
  '20 hours ago',
  '1 hour ago',
  '2 days ago',
  '14 hours ago',
  '6 days ago',
  '7 days ago',
];

export const orgRolesFixture: OrgRole[] = [
  {
    id: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
    name: 'Admin',
    scopes: ['admin'],
    isImmutable: true,
    createdAt: '2022-09-19T16:24:35.367322Z',
    numActiveUsers: 1,
  },
  {
    id: 'orgrole_erflKNWEF13143EWRWELJN',
    name: 'Member',
    isImmutable: true,
    scopes: ['read'],
    createdAt: '2023-01-06T05:11:08.415924Z',
    numActiveUsers: 5,
  },
  {
    id: 'orgrole_bX2flKNWEF13143EWRWELJN',
    name: 'Developer',
    isImmutable: true,
    scopes: ['api_keys'],
    createdAt: '2023-01-06T05:11:08.415924Z',
    numActiveUsers: 0,
  },
];

export const memberToEdit = orgMembersFixture.find(
  member => member.email === 'jane.doe@acme.com',
) as OrgMember;

export const memberToEditRole = orgRolesFixture.find(
  role => role.name === 'Developer',
) as OrgRole;

export const withOrgMembers = (orgMembers: OrgMember[] = orgMembersFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/members',
    response: {
      data: orgMembers,
      meta: {
        next: null,
        count: null,
      },
    },
  });

export const withOrgMembersError = () =>
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

export const withCreateOrgMembers = () =>
  mockRequest({
    method: 'post',
    path: '/org/members',
    response: null,
  });

export const withCreateOrgMembersError = () =>
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

export const withEditMember = (member: OrgMember, newRole: OrgRole) =>
  mockRequest({
    method: 'patch',
    path: `/org/members/${member.id}`,
    response: {
      ...member,
      roleId: newRole.id,
      roleName: newRole.name,
    },
  });

export const withEditMemberError = (member: OrgMember) =>
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

export const withRemoveOrgMember = (id: string) =>
  mockRequest({
    method: 'post',
    path: `/org/members/${id}/deactivate`,
    response: null,
  });

export const withRemoveOrgMemberError = (id: string) =>
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

export const withOrgRoles = (orgRoles: OrgRole[] = orgRolesFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/roles',
    response: {
      data: orgRoles,
      meta: {
        next: null,
        count: null,
      },
    },
  });

export const withOrgRolesError = () =>
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
