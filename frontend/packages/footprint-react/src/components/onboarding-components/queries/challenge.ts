import type { SandboxOutcome } from '@onefootprint/footprint-js';
import type { IdentifyResponse, LoginChallengeResponse, SignupChallengeResponse } from '@onefootprint/types';
import { InlineOtpNotSupported } from '../../../types/request';
import request from '../utils/request';

type EmailAndPassword = { email?: string; phoneNumber?: string };
type IdentifyRequestPayload = EmailAndPassword & { authToken?: string };
type CreateChallengeRequestPayload = IdentifyRequestPayload;

type RequestOptions = {
  onboardingConfig: string;
  sandboxId?: string;
  requiredAuthMethods?: string[];
};

export const identify = async (payload: IdentifyRequestPayload, options: RequestOptions) => {
  const { authToken, ...restPayload } = payload;
  const response = await request<IdentifyResponse>({
    url: '/hosted/identify',
    method: 'POST',
    data: { ...restPayload, scope: 'onboarding' },
    headers: {
      'X-Onboarding-Config-Key': options.onboardingConfig,
      'X-Sandbox-Id': options.sandboxId,
      'X-Fp-Authorization': authToken,
    },
  });
  return response;
};

const signupChallenge = async (payload: EmailAndPassword, options: RequestOptions) => {
  let preferredAuthMethod;
  if (options.requiredAuthMethods?.includes('phone')) {
    preferredAuthMethod = 'sms';
  } else if (options.requiredAuthMethods?.includes('email')) {
    preferredAuthMethod = 'email';
  }
  const response = await request<SignupChallengeResponse>({
    url: '/hosted/identify/signup_challenge',
    method: 'POST',
    data: {
      email: { value: payload.email, isBootstrap: false },
      phoneNumber: { value: payload.phoneNumber, isBootstrap: false },
      scope: 'onboarding',
      challengeKind: preferredAuthMethod,
    },
    headers: {
      'X-Onboarding-Config-Key': options.onboardingConfig,
      'X-Sandbox-Id': options.sandboxId,
      'X-Fp-Is-Components-Sdk': 'true',
    },
  });
  return response;
};

const loginChallenge = async (payload: { kind: 'sms' | 'email' }, options: { token: string }) => {
  const response = await request<LoginChallengeResponse>({
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

export const createChallenge = async (payload: CreateChallengeRequestPayload, options: RequestOptions) => {
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
      const hasEmail = identifyResponse.user.authMethods.some(
        authMethod => authMethod.kind === 'email' && authMethod.isVerified,
      );
      if (hasPhone) {
        const loginResponse = await loginChallenge({ kind: 'sms' }, { token: identifyResponse.user.token });
        return loginResponse;
      }
      if (hasEmail) {
        const signupResponse = await loginChallenge({ kind: 'email' }, { token: identifyResponse.user.token });
        return signupResponse;
      }
      throw new InlineOtpNotSupported('Cannot verify inline');
    }
  }
  const signupResponse = await signupChallenge(payload, options);
  return signupResponse;
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

const initOnboarding = async (options: { token: string; sandboxOutcome?: SandboxOutcome }) => {
  const response = await request<{ authToken: string }>({
    url: '/hosted/onboarding',
    method: 'POST',
    data: {
      fixture_result: options.sandboxOutcome?.overallOutcome,
    },
    headers: {
      'X-Fp-Authorization': options.token,
    },
  });
  return response;
};

export const createVaultingToken = async ({ authToken }: { authToken: string }) => {
  const response = await request<{ token: string; expiresAt: string }>({
    url: '/hosted/user/tokens',
    method: 'POST',
    headers: {
      'X-Fp-Authorization': authToken,
    },
    data: {
      requestedScope: 'onboarding_components',
    },
  });
  return response;
};

export const verifyChallenge = async (
  payload: { challenge: string; challengeToken: string },
  options: { token: string; sandboxOutcome?: SandboxOutcome },
) => {
  const response = await verify(payload, options);
  await getValidationToken({ token: response.authToken });
  await initOnboarding({ token: response.authToken, sandboxOutcome: options.sandboxOutcome });
  const vaultingToken = await createVaultingToken({ authToken: response.authToken });
  return {
    authToken: response.authToken,
    vaultingToken: vaultingToken.token,
  };
};
