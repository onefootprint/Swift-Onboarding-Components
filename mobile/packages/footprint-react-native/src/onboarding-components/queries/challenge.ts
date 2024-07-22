import request from 'src/utils/request';
import type { SandboxOutcome } from 'src/types';

type EmailAndPassword = { email?: string; phoneNumber?: string };

type RequestOptions = {
  onboardingConfig: string;
  sandboxId?: string;
};

type SignupResponse = {
  challengeData: {
    token: string;
    challengeKind: string;
    challengeToken: string;
    biometricChallengeJson: null;
    timeBeforeRetryS: number;
  };
  error: unknown;
};

const identify = async (payload: EmailAndPassword, options: RequestOptions) => {
  const response = await request<{ user: unknown }>({
    url: '/hosted/identify',
    method: 'POST',
    data: { ...payload, scope: 'onboarding' },
    headers: {
      'X-Onboarding-Config-Key': options.onboardingConfig,
      'X-Sandbox-Id': options.sandboxId,
    },
  });
  return response;
};

const signupChallenge = async (payload: EmailAndPassword, options: RequestOptions) => {
  const response = await request<SignupResponse>({
    url: '/hosted/identify/signup_challenge',
    method: 'POST',
    data: {
      email: { value: payload.email, isBootstrap: false },
      phoneNumber: { value: payload.phoneNumber, isBootstrap: false },
      scope: 'onboarding',
    },
    headers: {
      'X-Onboarding-Config-Key': options.onboardingConfig,
      'X-Sandbox-Id': options.sandboxId,
    },
  });
  return response;
};

export const createChallenge = async (payload: EmailAndPassword, options: RequestOptions) => {
  const identifyResponse = await identify(payload, options);
  if (identifyResponse.user) {
    throw new Error('to be implemented');
  }
  const signupResponse = await signupChallenge(payload, options);
  return signupResponse;
};

const verify = async (
  payload: { challenge: string; challengeToken: string },
  options: { token: string },
) => {
  const response = await request<{ authToken: string }>({
    url: '/hosted/identify/verify',
    method: 'POST',
    data: {
      challengeResponse: payload.challenge,
      challengeToken: payload.challengeToken,
      scope: 'onboarding',
    },
    headers: {
      'X-Fp-Authorization': options.token,
    },
  });
  return response;
};
const getValidationToken = async (options: { token: string }) => {
  const response = await request<{ validationToken: string }>({
    url: '/hosted/identify/validation_token',
    method: 'POST',
    headers: {
      'X-Fp-Authorization': options.token,
    },
  });
  return response;
};

const initOnboarding = async (options: { token: string, sandboxOutcome: SandboxOutcome }) => {
  const response = await request<{ authToken: string }>({
    url: '/hosted/onboarding',
    method: 'POST',
    data: {
      fixture_result: options.sandboxOutcome,
    },
    headers: {
      'X-Fp-Authorization': options.token,
    },
  });
  return response;
};

export const verifyChallenge = async (
  payload: { challenge: string; challengeToken: string },
  options: { token: string, sandboxOutcome: SandboxOutcome },
) => {
  const response = await verify(payload, options);
  await getValidationToken({ token: response.authToken });
  await initOnboarding({ token: response.authToken, sandboxOutcome: options.sandboxOutcome });
  return response;
};
