import {
  getActorOrganization,
  getInsightEvent,
  getListEvent,
  getListEventDetailCreateListEntry,
} from '@onefootprint/fixtures/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

export const timelineFixture = {
  data: [
    getListEvent({
      id: 'ae_S6wwoBVLzJaZBTVgwy3NxI',
      timestamp: '2024-04-03T20:56:33.333769Z',
      tenantId: 'org_wrMg7lhSpZif14SIhC9ihL',
      name: 'create_list_entry',
      principal: getActorOrganization({ member: 'Belce Dogru (belce@onefootprint.com)' }),
      insightEvent: getInsightEvent({}),
      detail: getListEventDetailCreateListEntry({
        data: {
          listId: 'list_123',
          listEntryCreationId: 'lec_LH5UtPrBymQ9DSZXCKNNpp',
          entries: ['test.com', 'test2.com'],
        },
      }),
    }),
  ],
  meta: {
    next: null,
    count: null,
  },
};

export const withListTimeline = (id: string) =>
  mockRequest({
    path: `/org/lists/${id}/timeline`,
    method: 'get',
    response: timelineFixture,
  });

const listDetailsFixture = {
  id: 'list_123',
  actor: {
    kind: 'footprint',
  },
  alias: 'my_list',
  created_at: 'date',
  kind: 'email_domain',
  name: 'Email List',
  playbooks: [],
};

export const withListDetails = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    response: listDetailsFixture,
  });

export const withListTimelineError = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}/timeline`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
