import { mockRequest } from '@onefootprint/test-utils';
import { ActorKind, ListKind } from '@onefootprint/types';

export const timelineFixture = {
  data: [
    {
      id: 'ae_S6wwoBVLzJaZBTVgwy3NxI',
      timestamp: '2024-04-03T20:56:33.333769Z',
      tenant_id: 'org_wrMg7lhSpZif14SIhC9ihL',
      name: 'create_list_entry',
      principal: {
        kind: 'organization',
        member: 'Belce Dogru (belce@onefootprint.com)',
      },
      insight_event: {
        timestamp: '2024-04-03T20:56:33.301745Z',
        ip_address: '47.150.244.180',
        city: 'Huntington Beach',
        country: 'United States',
        region: 'CA',
        region_name: 'California',
        latitude: 33.675,
        longitude: -118.0027,
        metro_code: '803',
        postal_code: '92648',
        time_zone: 'America/Los_Angeles',
        user_agent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      detail: {
        kind: 'create_list_entry',
        data: {
          list_entry_creation_id: 'lec_LH5UtPrBymQ9DSZXCKNNpp',
          entries: ['test.com', 'test2.com'],
        },
      },
    },
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
    kind: ActorKind.footprint,
  },
  alias: 'my_list',
  created_at: 'date',
  kind: ListKind.emailDomain,
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
