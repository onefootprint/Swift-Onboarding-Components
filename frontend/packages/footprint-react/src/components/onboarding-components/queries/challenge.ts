import type { IdentifyResponse, LoginChallengeResponse, SignupChallengeResponse } from '@onefootprint/types';
import { InlineOtpNotSupported } from '../../../types/request';
import request from '../utils/request';

type EmailAndPassword = { email?: string; phoneNumber?: string };

type RequestOptions = {
  onboardingConfig: string;
  sandboxId?: string;
  requiredAuthMethods?: string[];
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
