import { mockRequest } from '@onefootprint/test-utils';
import type { Entity, GetAuthRoleResponse } from '@onefootprint/types';
import { EntityKind, EntityStatus } from '@onefootprint/types';

export const entitiesFixture: Entity[] = [
  {
    id: 'fp_id_wL6XIWe26cRinucZrRK1yn',
    isIdentifiable: true,
    kind: EntityKind.person,
    requiresManualReview: false,
    status: EntityStatus.pass,
    data: [],
    attributes: [],
    decryptableAttributes: [],
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
    id: '_private_it_org_1',
    name: 'Footprint Live Integration Testing',
    logoUrl: null,
    isSandboxRestricted: false,
    websiteUrl: null,
    companySize: null,
    domains: [],
    allowDomainAccess: false,
    isDomainAlreadyClaimed: null,
    isAuthMethodSupported: true,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
  },
  {
    id: '_private_it_org_3',
    name: 'Footprint Integration Testing Foo',
    logoUrl: null,
    isSandboxRestricted: false,
    websiteUrl: null,
    companySize: null,
    domains: [],
    allowDomainAccess: false,
    isDomainAlreadyClaimed: null,
    isAuthMethodSupported: false,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
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
