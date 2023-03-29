import { mockRequest } from '@onefootprint/test-utils';

export const onboardingConfig = {
  id: 'ob_config_id_18RIzpIPRAL3pYlnO4Cgeb',
  key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
  name: 'Acme Bank',
  org_name: 'Acme Bank',
  logo_url: null,
  must_collect_data: ['name', 'dob', 'document'],
  can_access_data: ['dob', 'document'],
  is_live: true,
  created_at: '2022-07-20T01:52:36.984290Z',
  status: 'enabled',
};

export const listOnboardingConfigsFixture = [onboardingConfig];

const withCreateOnboardingConfig = (data = listOnboardingConfigsFixture) =>
  mockRequest({
    method: 'post',
    path: '/org/onboarding_configs',
    response: {
      data,
    },
  });

export default withCreateOnboardingConfig;
