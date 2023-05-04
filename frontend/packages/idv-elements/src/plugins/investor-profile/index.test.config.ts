import { mockRequest } from '@onefootprint/test-utils';

export const withUserVaultValidate = () => {
  mockRequest({
    method: 'post',
    path: '/hosted/user/vault/validate',
    response: {
      data: {
        data: 'success',
      },
    },
  });
};

export const withUserVault = () =>
  mockRequest({
    method: 'patch',
    path: '/hosted/user/vault',
    response: {
      data: {
        data: 'success',
      },
    },
  });

export const onboardingConfigFixture = {
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
};

export const withOnboardingConfig = (data = onboardingConfigFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/onboarding_config',
    response: {
      data,
    },
  });
