import { InlineOtpNotSupported, type SandboxOutcome } from 'src/types';
import request from 'src/utils/request';

type EmailAndPassword = { email?: string; phoneNumber?: string };

type RequestOptions = {
  onboardingConfig: string;
  sandboxId?: string;
};

type ChallengeResponse = {
  challengeData: {
    token: string;
    challengeKind: string;
    challengeToken: string;
    biometricChallengeJson: null;
    timeBeforeRetryS: number;
  };
  error: unknown;
};

export type IdentifiedAuthMethod = {
  kind: 'phone' | 'email' | 'passkey';
  isVerified: boolean;
};

export type IdentifyResponse = {
  user: {
    token: string;
    authMethods: IdentifiedAuthMethod[];
    isUnverified: boolean;
    scrubbedEmail?: string;
    scrubbedPhone?: string;
  } | null;
};

const identify = async (payload: EmailAndPassword, options: RequestOptions) => {
  const response = await request<IdentifyResponse>({
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
  const response = await request<ChallengeResponse>({
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

const loginChallenge = async (payload: { kind: 'sms' }, options: { token: string }) => {
  const response = await request<ChallengeResponse>({
    url: '/hosted/identify/login_challenge',
    method: 'POST',
    data: {
      preferredChallengeKind: payload.kind,
    },
    headers: {
      'X-Fp-Authorization': options.token,
    },
  });
  return response;
};

const verify = async (payload: { challenge: string; challengeToken: string }, options: { token: string }) => {
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

const initOnboarding = async (options: { token: string; sandboxOutcome: SandboxOutcome }) => {
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
  options: { token: string; sandboxOutcome: SandboxOutcome },
) => {
  const response = await verify(payload, options);
  await getValidationToken({ token: response.authToken });
  await initOnboarding({ token: response.authToken, sandboxOutcome: options.sandboxOutcome });
  return response;
};

export const createChallenge = async (payload: EmailAndPassword, options: RequestOptions) => {
  const identifyResponse = await identify(payload, options);
  if (identifyResponse.user) {
    if (identifyResponse.user.authMethods) {
      const hasVerifiedSource = identifyResponse.user.authMethods.some(authMethod => authMethod.isVerified);
      if (!hasVerifiedSource) {
        throw new InlineOtpNotSupported('Cannot verify inline');
      }
      const hasPhone = identifyResponse.user.authMethods.some(
        authMethod => authMethod.kind === 'phone' && authMethod.isVerified,
      );
      if (hasPhone) {
        const loginResponse = await loginChallenge({ kind: 'sms' }, { token: identifyResponse.user.token });
        return loginResponse;
      }
    }
  }
  const signupResponse = await signupChallenge(payload, options);
  return signupResponse;
};
