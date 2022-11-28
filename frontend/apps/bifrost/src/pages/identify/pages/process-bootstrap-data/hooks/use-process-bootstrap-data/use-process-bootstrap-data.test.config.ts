import { mockRequest } from '@onefootprint/test-utils';
import {
  ChallengeKind,
  IdentifyResponse,
  LoginChallengeResponse,
  SignupChallengeResponse,
} from '@onefootprint/types';

const identifyFixture: IdentifyResponse = {
  userFound: true,
  availableChallengeKinds: [ChallengeKind.sms],
};

export const withIdentify = (data = identifyFixture) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify',
    response: data,
  });

const identifySmsChallengeNotAvailableFixture: IdentifyResponse = {
  userFound: true,
  availableChallengeKinds: [ChallengeKind.biometric],
};

export const withIdentifySmsChallengeNotAvailable = (
  data = identifySmsChallengeNotAvailableFixture,
) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify',
    response: data,
  });

const identifyUserNotFoundFixture: IdentifyResponse = {
  userFound: false,
  availableChallengeKinds: [],
};

export const withIdentifyUserNotFound = (data = identifyUserNotFoundFixture) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify',
    response: data,
  });

const loginChallengeFixture: LoginChallengeResponse = {
  challengeData: {
    challengeToken: 'challengeToken',
    challengeKind: ChallengeKind.sms,
  },
};

export const withLoginChallenge = (data = loginChallengeFixture) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/login_challenge',
    response: data,
  });

const signupChallengeFixture: SignupChallengeResponse = {
  challengeToken: 'challengeToken',
};

export const withSignupChallenge = (data = signupChallengeFixture) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/signup_challenge',
    response: data,
  });
