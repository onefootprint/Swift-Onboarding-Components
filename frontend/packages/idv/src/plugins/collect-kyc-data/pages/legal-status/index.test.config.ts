import { mockRequest } from '@onefootprint/test-utils';

export const withIdentify = (availableChallengeKinds?: string[], hasSyncablePasskey?: boolean) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify',
    response: {
      user: {
        isUnverified: false,
        availableChallengeKinds,
        hasSyncablePasskey,
      },
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

export const withUserVault = () => {
  mockRequest({
    method: 'patch',
    path: '/hosted/user/vault',
    response: {
      data: {
        data: 'success',
      },
    },
  });
};
