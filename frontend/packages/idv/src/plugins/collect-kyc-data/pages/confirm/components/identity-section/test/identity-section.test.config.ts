import { mockRequest } from '@onefootprint/test-utils';
import { IdDI } from '@onefootprint/types';

import * as getBiometricChallengeResponse from '../hooks/use-step-up/utils/get-biometric-challenge-response';

// This needs to be mocked here and in the test itself as it is a esModule
jest.mock('../hooks/use-step-up/utils/get-biometric-challenge-response', () => ({
  __esModule: true,
  ...jest.requireActual('../hooks/use-step-up/utils/get-biometric-challenge-response'),
}));

export const mockGenerateBiometricResponseImpl = jest.fn(
  (): Promise<string> =>
    new Promise(resolve => {
      resolve(
        '{"rawId":"rawId","id":"id","type":"public-key","response":{"clientDataJSON":{},"authenticatorData":{},"signature":"signature"}}',
      );
    }),
);

export const mockGetBiometricChallengeResponse = () =>
  jest.spyOn(getBiometricChallengeResponse, 'default').mockImplementation(mockGenerateBiometricResponseImpl);

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

export const withDecryptUser = (ssn9: string) =>
  mockRequest({
    method: 'post',
    path: '/hosted/user/vault/decrypt',
    response: {
      [IdDI.ssn9]: ssn9,
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
