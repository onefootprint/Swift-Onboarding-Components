import { mockRequest } from '@onefootprint/test-utils';
import type { Entity } from '@onefootprint/types';
import { EntityKind, EntityStatus } from '@onefootprint/types';

export const entityFixture: Entity = {
  id: 'fp_id_yCZehsWNeywHnk5JqL20u',
  isIdentifiable: true,
  workflows: [],
  kind: EntityKind.person,
  attributes: [],
  data: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  lastActivityAt: '2023-03-27T14:43:47.444716Z',
  requiresManualReview: false,
  status: EntityStatus.pass,
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  label: null,
};

export const withEntity = () =>
  mockRequest({
    method: 'get',
    path: `/entities/${entityFixture.id}`,
    statusCode: 200,
    response: entityFixture,
  });
