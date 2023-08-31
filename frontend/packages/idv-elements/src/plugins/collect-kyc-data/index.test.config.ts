import { mockRequest } from '@onefootprint/test-utils';
import { ChallengeKind, UserTokenScope } from '@onefootprint/types';

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
  key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
  name: 'Acme Bank',
  org_name: 'Acme Bank',
  logo_url: null,
  is_live: true,
  status: 'enabled',
  is_no_phone_flow: false,
  requires_id_doc: false,
  is_kyb: false,
  allow_international_residents: false,
};

export const withOnboardingConfig = (data = onboardingConfigFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/onboarding_config',
    response: {
      data,
    },
  });

export const withUserToken = () =>
  mockRequest({
    method: 'get',
    path: '/hosted/user/token',
    response: {
      scopes: [UserTokenScope.sensitiveProfile],
    },
  });

export const withIdentify = () =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify',
    response: {
      userFound: true,
      availableChallengeKinds: [ChallengeKind.biometric],
      hasSyncablePassKey: true,
    },
  });
