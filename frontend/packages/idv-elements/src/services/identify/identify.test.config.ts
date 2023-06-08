import { mockRequest } from '@onefootprint/test-utils';
import { ChallengeKind, CollectedKycDataOption } from '@onefootprint/types';

export const getOnboardingConfig = (isLive?: boolean) => ({
  id: 'ob_config_id_18RIzpIPRAL3pYlnO4Cgeb',
  key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
  name: 'Acme Bank',
  org_name: 'Acme Bank',
  logo_url: null,
  must_collect_data: [
    CollectedKycDataOption.email,
    CollectedKycDataOption.phoneNumber,
  ],
  can_access_data: [],
  is_live: !!isLive,
  created_at: '2022-07-20T01:52:36.984290Z',
  status: 'enabled',
});

export const liveOnboardingConfigFixture = getOnboardingConfig(true);
export const sandboxOnboardingConfigFixture = getOnboardingConfig(false);

export const withOnboardingConfig = (data = sandboxOnboardingConfigFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/onboarding_config',
    response: data,
  });

export const withIdentify = (userFound?: boolean) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify',
    response: {
      userFound,
      availableChallengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
      hasSyncablePassKey: true,
    },
  });

export const withLoginChallenge = (challengeKind: ChallengeKind) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/login_challenge',
    response: {
      challengeData: {
        scrubbedPhoneNumber: '+1 (•••) •••-••99',
        biometricChallengeJson: {},
        challengeToken: 'token',
        challengeKind,
      },
    },
  });
