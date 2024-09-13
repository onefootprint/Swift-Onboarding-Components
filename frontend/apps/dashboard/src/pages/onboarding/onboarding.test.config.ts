import { mockRequest } from '@onefootprint/test-utils';
import type { Organization, Role, UserUpdateResponse } from '@onefootprint/types';
import { OnboardingStatus, RoleKind, RoleScopeKind } from '@onefootprint/types';

export const userFixture: UserUpdateResponse = {
  email: 'jane.doe@acme.com',
  firstName: 'Jane',
  lastName: 'Doe',
};

export const orgFixture: Organization = {
  id: 'org_9242CAdpXXlDDeSmi1DQks',
  name: 'Acme Inc',
  logoUrl: null,
  isSandboxRestricted: false,
  websiteUrl: null,
  companySize: null,
  domains: [],
  allowDomainAccess: false,
  isDomainAlreadyClaimed: false,
  isProdKybPlaybookRestricted: false,
  isProdKycPlaybookRestricted: false,
  parent: null,
  allowedPreviewApis: [],
};

export const RolesFixture: Role[] = [
  {
    id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
    name: 'Admin',
    scopes: [{ kind: RoleScopeKind.admin }],
    isImmutable: true,
    createdAt: '2022-09-19T16:24:35.367322Z',
    numActiveUsers: 1,
    numActiveApiKeys: 2,
    kind: RoleKind.dashboardUser,
  },
  {
    id: 'Role_erflKNWEF13143EWRWELJN',
    name: 'Member',
    isImmutable: true,
    scopes: [{ kind: RoleScopeKind.read }],
    createdAt: '2023-01-06T05:11:08.415924Z',
    numActiveUsers: 0,
    numActiveApiKeys: 3,
    kind: RoleKind.dashboardUser,
  },
];

export const withUpdateUser = (response: UserUpdateResponse = userFixture) =>
  mockRequest({
    method: 'patch',
    path: '/org/member',
    response,
  });

export const withOrg = (response: Organization = orgFixture) =>
  mockRequest({
    method: 'get',
    path: '/org',
    response,
  });

export const withUpdateOrg = (response: Partial<Organization> = orgFixture) =>
  mockRequest({
    method: 'patch',
    path: '/org',
    response,
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

export const withInviteMember = () =>
  mockRequest({
    method: 'post',
    path: '/org/members',
    response: null,
  });

export const withNoInProgressOnboardings = () =>
  mockRequest({
    method: 'get',
    path: '/org/member/in_progress_onboardings',
    statusCode: 200,
    response: {
      data: [],
    },
  });

export const withInProgressOnboarding = () =>
  mockRequest({
    method: 'get',
    path: '/org/member/in_progress_onboardings',
    statusCode: 200,
    response: [
      {
        fpId: '1',
        status: OnboardingStatus.incomplete,
        tenant: {
          name: 'Flexcar',
          websiteUrl: 'https://flexcar.com',
        },
        timestamp: '2023-05-01T12:00:00Z',
      },
    ],
  });
