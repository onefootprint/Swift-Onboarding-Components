import request from 'src/utils/request';

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
  { challenge, challengeToken }: { challenge: string; challengeToken: string },
  { token }: { token: string },
) => {
  const response = await request<{ authToken: string }>({
    url: '/hosted/identify/verify',
    method: 'POST',
    data: {
      challengeResponse: challenge,
      challengeToken,
      scope: 'onboarding',
    },
    headers: {
      'X-Fp-Authorization': token,
    },
  });
  return response;
};
const getValidationToken = async ({ token }: { token: string }) => {
  const response = await request<{ validationToken: string }>({
    url: '/hosted/identify/validation_token',
    method: 'POST',
    headers: {
      'X-Fp-Authorization': token,
    },
  });
  return response;
};

const initOnboarding = async ({ token }: { token: string }) => {
  const response = await request<{ authToken: string }>({
    url: '/hosted/onboarding',
    method: 'POST',
    data: {
      fixture_result: 'pass',
    },
    headers: {
      'X-Fp-Authorization': token,
    },
  });
  return response;
};

export const verifyChallenge = async (
  payload: { challenge: string; challengeToken: string },
  options: { token: string },
) => {
  const response = await verify(payload, options);
  await getValidationToken({ token: response.authToken });
  await initOnboarding({ token: response.authToken });
  return response;
};
