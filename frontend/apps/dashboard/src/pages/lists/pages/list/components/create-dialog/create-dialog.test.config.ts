import { getList } from '@onefootprint/fixtures/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

export const getListsFixture = {
  data: [
    getList({
      id: '1',
      actor: {
        kind: 'footprint',
      },
      name: 'List 1',
      createdAt: '2022-09-19T16:24:35.367322Z',
      alias: 'my_list',
      kind: 'email_address',
      entriesCount: 0,
      usedInPlaybook: false,
    }),
  ],
  meta: {
    count: 10,
  },
};

export const createdListFixture = {
  data: [
    getList({
      id: '2',
      actor: {
        kind: 'footprint',
      },
      name: 'List 2',
      createdAt: '2023-01-06T05:11:08.415924Z',
      kind: 'ssn9',
      alias: 'my_list2',
      entriesCount: 0,
      usedInPlaybook: false,
    }),
  ],
  meta: {
    count: 10,
  },
};

export const withLists = (data = getListsFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/lists',
    response: data,
  });

export const withCreateList = (data = createdListFixture) =>
  mockRequest({
    method: 'post',
    path: '/org/lists',
    response: data,
  });
