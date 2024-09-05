import { mockRequest } from '@onefootprint/test-utils';
import { EntityLabel } from '@onefootprint/types';

export const entityIdFixture: string = 'fp_id_yCZehsWNeywHnk5JqL20u';

export const withLabel = (kind: EntityLabel | null = EntityLabel.offboard_fraud) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entityIdFixture}/label`,
    response: {
      kind,
      createdAt: '2024-02-20T12:00:00Z',
    },
  });

export const withLabelError = () =>
  mockRequest({
    method: 'get',
    path: `/entities/${entityIdFixture}/label`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withEditLabel = () => {
  mockRequest({
    method: 'post',
    path: `/entities/${entityIdFixture}/label`,
    response: {},
  });
};
