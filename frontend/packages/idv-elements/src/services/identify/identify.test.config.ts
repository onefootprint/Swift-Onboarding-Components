import { mockRequest } from '@onefootprint/test-utils';

export const sandboxOnboardingConfigFixture = {
  id: 'ob_config_id_18RIzpIPRAL3pYlnO4Cgeb',
  key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
  name: 'Acme Bank',
  org_name: 'Acme Bank',
  logo_url: null,
  must_collect_data: ['name', 'dob'],
  can_access_data: ['dob'],
  is_live: false,
  created_at: '2022-07-20T01:52:36.984290Z',
  status: 'enabled',
};

export const withOnboardingConfig = (data = sandboxOnboardingConfigFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/onboarding_config',
    response: data,
  });
