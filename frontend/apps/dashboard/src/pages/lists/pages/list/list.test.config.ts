import { mockRequest } from '@onefootprint/test-utils';
import { ActorKind, ListKind } from '@onefootprint/types';

export const listsFixture = {
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

export const withListsError = () =>
  mockRequest({
    method: 'get',
    path: '/org/lists',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
