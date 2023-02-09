import { mockRequest } from '@onefootprint/test-utils';
import { OrgMember, OrgRole, OrgRoleScope } from '@onefootprint/types';
import { useStore } from 'src/hooks/use-session';

const originalState = useStore.getState();

export const withCurrentUserDifferentFromMember = () => {
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
      meta: {
        createdNewTenant: false,
        isFirstLogin: false,
        requiresOnboarding: false,
      },
    },
  });
};

export const withCurrentUserSameAsMember = () => {
  useStore.setState({
    data: {
      auth: '1',
      user: {
        id: 'orguser_k0xUYuO2fFCwMHFPShuK77',
        email: 'jack.doe@acme.com',
        firstName: 'Jack',
        lastName: 'Doe',
      },
      org: {
        isLive: false,
        logoUrl: null,
        name: 'Acme',
        isSandboxRestricted: true,
      },
      meta: {
        createdNewTenant: false,
        isFirstLogin: false,
        requiresOnboarding: false,
      },
    },
  });
};

afterAll(() => {
  useStore.setState(originalState);
});

export const memberFixture = {
  id: 'orguser_k0xUYuO2fFCwMHFPShuK77',
  email: 'jack.doe@acme.com',
  firstName: 'Jack',
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
};

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
    numActiveUsers: 4,
  },
];

export const roleToSelectOnEdit = orgRolesFixture.find(
  role => role.name === 'Member',
) as OrgRole;

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
