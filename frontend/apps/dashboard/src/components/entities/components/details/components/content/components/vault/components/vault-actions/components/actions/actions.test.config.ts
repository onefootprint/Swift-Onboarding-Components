import { mockRequest } from '@onefootprint/test-utils';
import type { Entity, Timeline } from '@onefootprint/types';
import {
  ActorKind,
  CollectedKybDataOption,
  CollectedKycDataOption,
  DecisionStatus,
  EntityKind,
  EntityStatus,
  IdDI,
  ListKind,
  TimelineEventKind,
  WorkflowKind,
} from '@onefootprint/types';

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
    path: `/entities/${entityId}/actions`,
    statusCode: 200,
    response: [
      {
        kind: 'trigger',
        link: 'http://footprint.link/#tok_xxx',
      },
    ],
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
    path: `/entities/${entityId}/actions`,
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

export const timelineFixture: Timeline = [
  {
    event: {
      kind: TimelineEventKind.dataCollected,
      data: {
        attributes: [
          CollectedKybDataOption.name,
          CollectedKybDataOption.phoneNumber,
          CollectedKybDataOption.website,
          CollectedKybDataOption.address,
          CollectedKybDataOption.beneficialOwners,
          CollectedKybDataOption.tin,
        ],
        isPrefill: false,
      },
    },
    timestamp: '2023-04-05T11:16:13.599001Z',
    seqno: 1,
  },
  {
    event: {
      kind: TimelineEventKind.onboardingDecision,
      data: {
        decision: {
          id: 'decision_ukUpX59i8VJZiuk6boskdR',
          status: DecisionStatus.pass,
          timestamp: new Date('2023-04-05T11:17:06.773951Z'),
          source: {
            kind: ActorKind.footprint,
          },
          workflowKind: WorkflowKind.Kyc,
          obConfiguration: {
            id: 'ob_config_id_3o5SdynZVGO1icDm8Z6llC',
            name: 'My Playbook',
            mustCollectData: [
              CollectedKybDataOption.name,
              CollectedKybDataOption.address,
              CollectedKybDataOption.tin,
              CollectedKybDataOption.beneficialOwners,
              CollectedKycDataOption.name,
              CollectedKycDataOption.address,
              CollectedKycDataOption.phoneNumber,
              CollectedKycDataOption.dob,
              CollectedKycDataOption.ssn4,
            ],
          },
          vendors: [],
          ranRulesInSandbox: false,
        },
        annotation: null,
      },
    },
    timestamp: '2023-04-05T11:17:06.776409Z',
    seqno: 2,
  },
];

export const withTimeline = (entity = entityWithPhoneFixture, response = timelineFixture) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/timeline`,
    response,
  });

export const withData = (entity = entityWithPhoneFixture, response = {}) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/data`,
    response,
  });
