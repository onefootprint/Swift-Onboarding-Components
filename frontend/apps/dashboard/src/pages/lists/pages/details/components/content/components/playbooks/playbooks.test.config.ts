import { getList, getListDetails, getRiskScore, getRule } from '@onefootprint/fixtures/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

const listDetailsWithNoPlaybooksFixture = getListDetails({
  id: 'list_1',
  actor: {
    kind: 'footprint',
  },
  alias: 'my_list',
  createdAt: 'date',
  kind: 'email_address',
  name: 'Email List',
  playbooks: [],
});

const listDetailsFixture = getListDetails({
  id: 'list_1',
  actor: {
    kind: 'footprint',
  },
  alias: 'my_list',
  createdAt: 'date',
  kind: 'email_address',
  name: 'Email List',
  playbooks: [
    {
      id: 'playbook_1',
      name: 'Playbook 1',
      rules: [
        getRule({
          action: 'fail',
          createdAt: '01/01/2001',
          isShadow: false,
          ruleId: 'rule_1',
          name: 'rule_1',
          ruleExpression: [
            {
              field: getRiskScore('experian_score'),
              op: 'gt',
              value: 50,
            },
          ],
        }),
      ],
    },
    {
      id: 'playbook_2',
      name: 'Playbook 2',
      rules: [
        getRule({
          action: 'fail',
          createdAt: '01/01/2001',
          isShadow: false,
          ruleId: 'rule_2',
          name: 'rule_2',
          ruleExpression: [
            {
              field: 'id.email',
              op: 'is_in',
              value: 'list_1',
            },
          ],
        }),
      ],
    },
  ],
});

export const withListDetails = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    response: listDetailsFixture,
  });

export const withListDetailsNoPlaybooks = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    response: listDetailsWithNoPlaybooksFixture,
  });

export const withListError = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

const listsFixture = {
  data: [
    getList({
      id: '1',
      actor: {
        kind: 'footprint',
      },
      alias: 'my_list',
      createdAt: 'date',
      kind: 'email_address',
      name: 'Email List',
      entriesCount: 0,
      usedInPlaybook: false,
    }),
    getList({
      id: '2',
      actor: {
        kind: 'footprint',
      },
      alias: 'my_list2',
      createdAt: 'date',
      kind: 'ssn9',
      name: 'SSN List',
      entriesCount: 0,
      usedInPlaybook: false,
    }),
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
