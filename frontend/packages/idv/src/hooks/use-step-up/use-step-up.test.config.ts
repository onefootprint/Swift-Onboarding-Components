import { mockRequest } from '@onefootprint/test-utils';

import * as getBiometricChallengeResponse from './utils/get-biometric-challenge-response';

// This needs to be mocked here and in the test itself as it is a esModule
jest.mock('./utils/get-biometric-challenge-response', () => ({
  __esModule: true,
  ...jest.requireActual('./utils/get-biometric-challenge-response'),
}));

const mockGenerateBiometricResponse = (): Promise<string> =>
  new Promise(resolve => {
    resolve(
      '{"rawId":"rawId","id":"id","type":"public-key","response":{"clientDataJSON":{},"authenticatorData":{},"signature":"signature"}}',
    );
  });

export const mockGetBiometricChallengeResponse = () =>
  jest.spyOn(getBiometricChallengeResponse, 'default').mockImplementation(mockGenerateBiometricResponse);

export const withUserToken = (scopes: string[]) =>
  mockRequest({
    method: 'get',
    path: '/hosted/user/token',
    response: {
      scopes,
    },
  });

export const withUserTokenError = () =>
  mockRequest({
    method: 'get',
    path: '/hosted/user/token',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withIdentify = (_availableChallengeKinds?: string[], hasSyncablePasskey?: boolean) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify',
    response: {
      user: {
        isUnverified: false,
        availableChallengeKinds: ['sms', 'biometric'],
        hasSyncablePasskey,
      },
    },
  });

export const withIdentifyError = () =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
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

export const withLoginChallengeError = () =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/login_challenge',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
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
