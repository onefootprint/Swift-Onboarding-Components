import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import { mockRequest } from '@onefootprint/test-utils';
import { OnboardingConfigKind } from '@onefootprint/types';

export const playbooksFixture = [
  getOnboardingConfiguration({
    name: 'Playbook KYC',
    kind: OnboardingConfigKind.kyc,
    key: 'ob_test_gc1cmZRQoF4MAWGVegTh6T',
  }),
  getOnboardingConfiguration({
    name: 'Playbook KYB',
    kind: OnboardingConfigKind.kyb,
    key: 'ob_test_Y8Uzs96q0DgTehYdKI14f9',
  }),
  getOnboardingConfiguration({
    name: 'Playbook Auth',
    kind: OnboardingConfigKind.auth,
    key: 'ob_test_QhzzskOCGDZjvIKNzx91tY',
  }),
];

export const withPlaybooks = () => {
  return mockRequest({
    method: 'get',
    path: '/org/playbooks',
    response: {
      data: playbooksFixture,
      meta: {
        nextPage: 0,
        count: playbooksFixture.length,
      },
    },
  });
};

export const withPlaybooksError = () => {
  return mockRequest({
    method: 'get',
    path: '/org/playbooks',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
};
