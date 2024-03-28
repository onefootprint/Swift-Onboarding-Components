import { mockRequest } from '@onefootprint/test-utils';
import { ActorKind, ListKind } from '@onefootprint/types';

const listWithNoPlaybooksFixture = {
  id: 'list_1',
  actor: {
    kind: ActorKind.footprint,
  },
  alias: 'my_list',
  createdAt: 'date',
  kind: ListKind.emailAddress,
  name: 'Email List',
  entriesCount: 0,
  playbooks: [],
};

const listFixture = {
  id: 'list_1',
  actor: {
    kind: ActorKind.footprint,
  },
  alias: 'my_list',
  createdAt: 'date',
  kind: ListKind.emailAddress,
  name: 'Email List',
  entriesCount: 0,
  playbooks: [
    {
      id: 'playbook_1',
      name: 'Playbook 1',
      rules: [
        {
          ruleId: 'rule_1',
          ruleExpression: [
            {
              field: 'email',
              op: 'is',
              value: 'test@onefootprint.com',
            },
          ],
        },
      ],
    },
    {
      id: 'playbook_2',
      name: 'Playbook 2',
      rules: [
        {
          ruleId: 'rule_2',
          ruleExpression: [
            {
              field: 'email',
              op: 'is',
              value: 'test2@onefootprint.com',
            },
          ],
        },
      ],
    },
  ],
};

export const withList = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    response: listFixture,
  });

export const withListNoPlaybooks = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    response: listWithNoPlaybooksFixture,
  });

export const withListError = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
