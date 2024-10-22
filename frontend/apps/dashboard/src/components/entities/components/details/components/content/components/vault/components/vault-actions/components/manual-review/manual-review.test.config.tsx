import { mockRequest } from '@onefootprint/test-utils';
import type { Entity } from '@onefootprint/types';
import { EntityKind, EntityStatus } from '@onefootprint/types';

export const entityFixture: Entity = {
  id: 'fp_id_yCZehsWNeywHnk5JqL20u',
  isIdentifiable: true,
  workflows: [],
  kind: EntityKind.person,
  data: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  lastActivityAt: '2023-03-27T14:43:47.444716Z',
  requiresManualReview: false,
  status: EntityStatus.pass,
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  label: null,
};

export const withEntity = (entityId: string) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entityId}`,
    statusCode: 200,
    response: entityFixture,
  });

export const withDecision = (entityId: string) =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityId}/actions`,
    response: {},
  });

export const withDecisionError = (entityId: string) =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityId}/actions`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
