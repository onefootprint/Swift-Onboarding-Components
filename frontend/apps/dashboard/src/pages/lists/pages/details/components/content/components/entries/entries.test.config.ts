import { getListDetails, getListEntry } from '@onefootprint/fixtures/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

export const entriesFixture = [
  getListEntry({
    id: 'entry_1',
    data: 'test@onefootprint.com',
  }),
  getListEntry({
    id: 'entry_2',
    data: 'test2@onefootprint.com',
  }),
  getListEntry({
    id: 'entry_3',
    data: 'test3@onefootprint.com',
  }),
  getListEntry({
    id: 'entry_4',
    data: 'test4@onefootprint.com',
  }),
  getListEntry({
    id: 'entry_5',
    data: 'test5@onefootprint.com',
  }),
  getListEntry({
    id: 'entry_6',
    data: 'test6@onefootprint.com',
  }),
  getListEntry({
    id: 'entry_7',
    data: 'test7@onefootprint.com',
  }),
  getListEntry({
    id: 'entry_8',
    data: 'test8@onefootprint.com',
  }),
  getListEntry({
    id: 'entry_9',
    data: 'test9@onefootprint.com',
  }),
  getListEntry({
    id: 'entry_10',
    data: 'test10@onefootprint.com',
  }),
];

const listDetailsFixture = getListDetails({
  id: 'list_1',
  actor: {
    kind: 'footprint',
  },
  alias: 'my_list',
  kind: 'email_address',
  name: 'Email List',
  playbooks: [],
});

export const withDeleteError = (listId: string, entryId: string) =>
  mockRequest({
    method: 'delete',
    path: `/org/lists/${listId}/entries/${entryId}`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withDelete = (listId: string, entryId: string) =>
  mockRequest({
    method: 'delete',
    path: `/org/lists/${listId}/entries/${entryId}`,
    response: {},
  });

export const withListDetails = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    response: listDetailsFixture,
  });

export const withListEntries = (listId: string, data = entriesFixture) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}/entries`,
    response: data,
  });

export const withListEntriesError = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}/entries`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
