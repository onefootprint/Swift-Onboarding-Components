import { mockRequest } from '@onefootprint/test-utils';

export const listsFixture = {
  data: [
    {
      id: '1',
      actor: {
        kind: 'footprint',
      },
      alias: 'my_list',
      created_at: 'date',
      kind: 'email_address',
      name: 'Email List',
      entries_count: 0,
      used_in_playbook: false,
    },
    {
      id: '2',
      actor: {
        kind: 'footprint',
      },
      alias: 'my_list2',
      created_at: 'date',
      kind: 'ssn9',
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

export const withListsEmpty = () =>
  mockRequest({
    method: 'get',
    path: '/org/lists',
    response: { data: [], meta: { count: 0 } },
  });
