import { mockRequest } from '@onefootprint/test-utils';
import {
  GetAuthRoleResponse,
  OrgAssumeRoleResponse,
  RoleScopeKind,
} from '@onefootprint/types';

export const getOrgAuthRoleFixture: GetAuthRoleResponse = [
  {
    id: '_private_it_org_1',
    name: 'Footprint Live Integration Testing',
    logoUrl: null,
    isSandboxRestricted: false,
    websiteUrl: null,
    companySize: null,
    domain: null,
    allowDomainAccess: false,
    isDomainAlreadyClaimed: null,
    isAuthMethodSupported: true,
  },
  {
    id: '_private_it_org_3',
    name: 'Footprint Integration Testing Foo',
    logoUrl: null,
    isSandboxRestricted: false,
    websiteUrl: null,
    companySize: null,
    domain: null,
    allowDomainAccess: false,
    isDomainAlreadyClaimed: null,
    isAuthMethodSupported: false,
  },
];

export const withOrgAuthRoles = () =>
  mockRequest({
    method: 'get',
    path: '/org/auth/roles',
    response: getOrgAuthRoleFixture,
  });

export const withOrgAuthRolesError = () =>
  mockRequest({
    method: 'get',
    path: '/org/auth/roles',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const orgAssumeRoleFixture: OrgAssumeRoleResponse = {
  user: {
    id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
    email: 'jane@onefootprint.com',
    firstName: null,
    lastName: null,
    role: {
      createdAt: '2022-09-19T16:24:34.368337Z',
      id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Admin',
      numActiveUsers: 1,
      numActiveApiKeys: 0,
      scopes: [{ kind: RoleScopeKind.admin }],
    },
    rolebinding: {
      lastLoginAt: '2023-01-18T17:54:10.668420Z',
    },
  },
  tenant: {
    id: '_private_it_org_1',
    name: 'Footprint Live Integration Testing',
    logoUrl: null,
    isSandboxRestricted: false,
    websiteUrl: null,
    companySize: null,
    domain: null,
    allowDomainAccess: false,
    isDomainAlreadyClaimed: null,
  },
};

export const withOrgAssumeRole = () =>
  mockRequest({
    method: 'post',
    path: '/org/auth/assume_role',
    response: orgAssumeRoleFixture,
  });

export const withOrgAssumeRoleError = () =>
  mockRequest({
    method: 'post',
    path: '/org/auth/assume_role',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
