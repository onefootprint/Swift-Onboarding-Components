import { mockRequest } from '@onefootprint/test-utils';
import type { Entity } from '@onefootprint/types';
import { ActorKind, EntityKind, EntityStatus, IdDI, ListKind } from '@onefootprint/types';

export const entityId = 'fp_id_yCZehsWNeywHnk5JqL20u';
export const entityWithPhoneFixture: Entity = {
  id: entityId,
  isIdentifiable: true,
  kind: EntityKind.person,
  data: [],
  attributes: [IdDI.phoneNumber],
  decryptableAttributes: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  lastActivityAt: '2023-03-27T14:43:47.444716Z',
  requiresManualReview: false,
  status: EntityStatus.pass,
  decryptedAttributes: {},
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  label: null,
  workflows: [
    {
      createdAt: '2023-03-27T14:43:47.444716Z',
      playbookId: 'obc_123',
    },
  ],
};

export const entityWithoutPhoneFixture: Entity = {
  id: entityId,
  isIdentifiable: true,
  kind: EntityKind.person,
  data: [],
  attributes: [],
  decryptableAttributes: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  lastActivityAt: '2023-03-27T14:43:47.444716Z',
  requiresManualReview: false,
  status: EntityStatus.pass,
  decryptedAttributes: {},
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  label: null,
  workflows: [
    {
      createdAt: '2023-03-27T14:43:47.444716Z',
      playbookId: 'obc_123',
    },
  ],
};

export const withEntity = (entityFixture: Entity) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entityId}`,
    statusCode: 200,
    response: entityFixture,
  });

export const withTrigger = () =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityId}/triggers`,
    statusCode: 200,
    response: {
      link: 'http://footprint.link/#tok_xxx',
    },
  });

export const withTokenSendLink = (deliveryMethod: string) =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityId}/token`,
    statusCode: 200,
    response: {
      deliveryMethod,
    },
  });

export const withTriggerError = () =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityId}/triggers`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

const listsFixture = {
  data: [
    {
      id: '1',
      actor: {
        kind: ActorKind.footprint,
      },
      alias: 'my_list',
      created_at: 'date',
      kind: ListKind.emailAddress,
      name: 'Email List',
      entries_count: 0,
      used_in_playbook: false,
    },
    {
      id: '2',
      actor: {
        kind: ActorKind.footprint,
      },
      alias: 'my_list2',
      created_at: 'date',
      kind: ListKind.ssn9,
      name: 'SSN List',
      entries_count: 0,
      used_in_playbook: false,
    },
  ],
  meta: {
    count: 10,
  },
};

export const withLists = () =>
  mockRequest({
    method: 'get',
    path: '/org/lists',
    response: listsFixture,
  });
