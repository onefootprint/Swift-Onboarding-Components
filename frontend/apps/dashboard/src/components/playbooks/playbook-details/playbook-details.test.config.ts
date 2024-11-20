import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

export const playbookId: string = 'pb_Wmr4Z4OChzUsbcI2wnt5IH';

export const playbookDetailsFixture = getOnboardingConfiguration({
  id: 'pb_Wmr4Z4OChzUsbcI2wnt5IH',
});

export const withPlaybookDetails = (id: string, response = playbookDetailsFixture) => {
  return mockRequest({
    method: 'get',
    path: `/org/playbooks/${id}/versions`,
    response: {
      data: [response],
    },
  });
};

export const withPlaybookDetailsError = (id: string) => {
  return mockRequest({
    method: 'get',
    path: `/org/playbooks/${id}/versions`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
};
