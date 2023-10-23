import { mockRequest } from '@onefootprint/test-utils';

export const withIdentify = (
  availableChallengeKinds?: string[],
  hasSyncablePassKey?: boolean,
) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify',
    response: {
      userFound: true,
      isUnverified: false,
      availableChallengeKinds,
      hasSyncablePassKey,
    },
  });

export const withIdentifyVerify = () =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/verify',
    response: {
      authToken: 'new-token',
    },
  });

export const withLoginChallenge = (challengeKind: string) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/login_challenge',
    response: {
      challengeData: {
        biometricChallengeJson: {},
        challengeToken: {},
        challengeKind,
      },
    },
  });

export const withUserToken = (scopes: string[]) =>
  mockRequest({
    method: 'get',
    path: '/hosted/user/token',
    response: {
      scopes,
    },
  });

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
