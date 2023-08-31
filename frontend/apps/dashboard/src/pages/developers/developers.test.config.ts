import { mockRequest } from '@onefootprint/test-utils';

export const listApiKeysFixture = [
  {
    id: 'key_id_peQwDyoIX4BmxqeflDvq2d',
    name: 'Acme Bank',
    status: 'enabled',
    created_at: '2022-07-07T15:40:38.002041Z',
    key: null,
    last_used_at: '2022-07-07T16:40:38.002041Z',
    is_live: true,
  },
];

export const withApiKeys = (data = listApiKeysFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/api_keys',
    response: {
      data,
    },
  });

export const listOnboardingConfigsFixture = [
  {
    id: 'ob_config_id_18RIzpIPRAL3pYlnO4Cgeb',
    key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
    name: 'Acme Bank',
    org_name: 'Acme Bank',
    logo_url: null,
    must_collect_data: ['name', 'dob'],
    can_access_data: ['dob'],
    is_live: true,
    created_at: '2022-07-20T01:52:36.984290Z',
    status: 'enabled',
    allow_international_residents: false,
  },
];

export const withOnboardingConfigs = (data = listOnboardingConfigsFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/onboarding_configs',
    response: {
      data,
    },
  });
