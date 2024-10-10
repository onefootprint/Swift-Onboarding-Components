import { mockRequest } from '@onefootprint/test-utils';
import type { Entity } from '@onefootprint/types';
import { EntityKind, EntityStatus, WorkflowStatus } from '@onefootprint/types';

export const entityFixture: Entity = {
  id: 'fp_id_yCZehsWNeywHnk5JqL20u',
  isIdentifiable: true,
  workflows: [
    {
      createdAt: '2023-03-27T14:43:47.444716Z',
      status: WorkflowStatus.pass,
      playbookId: 'obc_id_123',
    },
  ],
  kind: EntityKind.person,
  attributes: [],
  data: [],
  decryptableAttributes: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  lastActivityAt: '2023-03-27T14:43:47.444716Z',
  requiresManualReview: false,
  status: EntityStatus.pass,
  decryptedAttributes: {},
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  label: null,
};

export const withEntity = (entityId: string, requiresManualReview?: boolean) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entityId}`,
    statusCode: 200,
    response: {
      ...entityFixture,
      requiresManualReview: requiresManualReview || false,
    },
  });
