import { mockRequest } from '@onefootprint/test-utils';
import type { Entity, GetAuthRoleResponse } from '@onefootprint/types';
import { EntityKind, EntityStatus } from '@onefootprint/types';

export const entitiesFixture: Entity[] = [
  {
    id: 'fp_id_wL6XIWe26cRinucZrRK1yn',
    isIdentifiable: true,
    workflows: [],
    kind: EntityKind.person,
    requiresManualReview: false,
    status: EntityStatus.pass,
    data: [],
    attributes: [],
    startTimestamp: '2023-03-29T23:07:44.435194Z',
    lastActivityAt: '2023-03-27T14:43:47.444716Z',
    decryptedAttributes: {},
    watchlistCheck: null,
    hasOutstandingWorkflowRequest: false,
    label: null,
  },
];

export const getOrgAuthRoleFixture: GetAuthRoleResponse = [
  {
    allowDomainAccess: false,
    allowedPreviewApis: [],
    companySize: null,
    domains: [],
    id: '_private_it_org_1',
    isAuthMethodSupported: true,
    isDomainAlreadyClaimed: null,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: null,
    name: 'Footprint Live Integration Testing',
    parent: null,
    websiteUrl: null,
  },
  {
    allowDomainAccess: false,
    allowedPreviewApis: [],
    companySize: null,
    domains: [],
    id: '_private_it_org_3',
    isAuthMethodSupported: false,
    isDomainAlreadyClaimed: null,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: null,
    name: 'Footprint Integration Testing Foo',
    parent: null,
    websiteUrl: null,
  },
];

export const withEntities = (response: Entity[] = entitiesFixture) =>
  mockRequest({
    method: 'post',
    path: '/entities/search',
    response: {
      data: response,
      meta: {},
    },
  });

export const withOrgAuthRoles = () =>
  mockRequest({
    method: 'get',
    path: '/org/auth/roles',
    response: getOrgAuthRoleFixture,
  });

export const withRiskSignals = () =>
  mockRequest({
    method: 'get',
    path: '/org/risk_signals',
    response: { data: [], meta: { count: 0 } },
  });

export const withLogout = () =>
  mockRequest({
    method: 'post',
    path: 'org/auth/logout',
    response: {},
  });

export const withOrg = () =>
  mockRequest({
    method: 'get',
    path: '/org',
    response: {
      data: {
        id: 'fp_id_wL6XIWe26cRinucZrRK1yn',
      },
    },
  });
