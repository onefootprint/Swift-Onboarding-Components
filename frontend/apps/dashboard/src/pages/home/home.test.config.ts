import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import type { OnboardingConfiguration, OrgMetricsResponse } from '@onefootprint/request-types/dashboard';
import { mockRequest } from '@onefootprint/test-utils';

export const orgMetricsFixture: OrgMetricsResponse = {
  user: {
    newVaults: 8910,
    totalOnboardings: 1058814,
    passOnboardings: 1036817,
    failOnboardings: 17187,
    incompleteOnboardings: 4810,
  },
  business: {
    newVaults: 30,
    totalOnboardings: 20,
    passOnboardings: 11,
    failOnboardings: 4,
    incompleteOnboardings: 5,
  },
};

export const emptyOrgMetricsFixture: OrgMetricsResponse = {
  user: {
    newVaults: 0,
    totalOnboardings: 0,
    passOnboardings: 0,
    failOnboardings: 0,
    incompleteOnboardings: 0,
  },
  business: {
    newVaults: 0,
    totalOnboardings: 0,
    passOnboardings: 0,
    failOnboardings: 0,
    incompleteOnboardings: 0,
  },
};

export const playbooksFixture: OnboardingConfiguration[] = [
  getOnboardingConfiguration({
    id: 'ob_config_id_LZuy8k6ch31LcTEZvyk7YX',
    name: 'Playbook 1',
  }),
  getOnboardingConfiguration({
    id: 'ob_config_id_Vwyu5yLZbnXFwrC4RwFnDp',
    name: 'Playbook 2',
  }),
  getOnboardingConfiguration({
    id: 'ob_config_id_m35ER0O2UEaAOHyZa0oAKR',
    name: 'Playbook 3',
  }),
];

export const withOrgMetrics = (response: OrgMetricsResponse = orgMetricsFixture) => {
  return mockRequest({
    method: 'get',
    path: '/org/metrics',
    response,
  });
};

export const withOrgMetricsError = () => {
  return mockRequest({
    method: 'get',
    path: '/org/metrics',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
};

export const withPlaybooks = (response: OnboardingConfiguration[] = playbooksFixture) => {
  return mockRequest({
    method: 'get',
    path: '/org/onboarding_configs',
    response,
  });
};
