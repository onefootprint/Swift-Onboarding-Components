import { mockRequest } from 'test-utils';

export const onboardingConfig = {
  id: 'ob_config_id_18RIzpIPRAL3pYlnO4Cgeb',
  key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
  name: 'Acme Bank',
  org_name: 'Acme Bank',
  logo_url: null,
  must_collect_data_kinds: ['first_name', 'last_name'],
  can_access_data_kinds: ['dob'],
  is_live: true,
  created_at: '2022-07-20T01:52:36.984290Z',
  status: 'enabled',
};

export const listOnboardingConfigsFixture = [onboardingConfig];

export const withOnboardingConfigs = (data = listOnboardingConfigsFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/onboarding_configs',
    response: {
      data,
    },
  });

export const withUpdateOnboardingConfigs = (
  currentData: Record<string, any>,
  newData: Record<string, any>,
) =>
  mockRequest({
    method: 'patch',
    path: `/org/onboarding_configs/${currentData.id}`,
    response: {
      ...currentData,
      ...newData,
    },
  });
