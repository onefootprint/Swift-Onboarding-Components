import { mockRequest } from '@onefootprint/test-utils';
import type { Entity, GetOrgTagsResponse, GetTagsResponse, Tag } from '@onefootprint/types';
import { EntityKind, EntityStatus, WorkflowStatus } from '@onefootprint/types';

export const tagsFixture: Tag[] = [
  { text: 'lorem', createdAt: '2023-05-27T14:43:47.444716Z' },
  { text: 'ipsum', createdAt: '2023-05-27T15:43:47.444716Z' },
  { text: 'bad_actor', createdAt: '2023-05-27T16:43:47.444716Z' },
  { text: 'fraudulent', createdAt: '2023-05-27T17:43:47.444716Z' },
];

export const getTagsResponseFixture: GetTagsResponse = tagsFixture.map((tag, index) => ({
  tag: tag.text,
  createdAt: tag.createdAt,
  id: `tag_${index}`,
}));

export const getOrgTagsResponseFixture: GetOrgTagsResponse = [
  {
    id: 'tt_0',
    kind: EntityKind.person,
    tag: 'lorem',
  },
  {
    id: 'tt_1',
    kind: EntityKind.person,
    tag: 'ipsum',
  },
  {
    id: 'tt_2',
    kind: EntityKind.person,
    tag: 'bad_actor',
  },
  {
    id: 'tt_3',
    kind: EntityKind.person,
    tag: 'fraudulent',
  },
  {
    id: 'tt_4',
    kind: EntityKind.person,
    tag: 'some_org_tag',
  },
  {
    id: 'tt_5',
    kind: EntityKind.person,
    tag: 'another_org_tag',
  },
];

export const entityIdFixture = 'fp_id_yCZehsWNeywHnk5JqL20u';

export const entityWithTagsFixture: Entity = {
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
  tags: tagsFixture,
};

export const entityWithoutTagsFixture: Entity = {
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

export const withEntity = (response = entityWithTagsFixture) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entityWithTagsFixture.id}`,
    statusCode: 200,
    response,
  });

export const withTags = (response = getTagsResponseFixture) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entityWithTagsFixture.id}/tags`,
    statusCode: 200,
    response,
  });

export const withOrgTags = (response = getOrgTagsResponseFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/tags',
    statusCode: 200,
    response,
  });

export const withRemoveTag = (tagId: string) =>
  mockRequest({
    method: 'delete',
    path: `/entities/${entityIdFixture}/tags/${tagId}`,
    statusCode: 200,
    response: {},
  });

export const withAddTag = () =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityIdFixture}/tags`,
    statusCode: 200,
    response: {},
  });

export const withCreateOrgTag = () =>
  mockRequest({
    method: 'post',
    path: '/org/tags',
    statusCode: 200,
    response: {},
  });
