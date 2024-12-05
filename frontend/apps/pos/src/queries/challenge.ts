import { fpRequest } from '../config/request';

export const signupChallenge = async (payload, options) => {
  const data = {
    scope: 'onboarding',
    challenge_kind: 'sms',
    ...(payload.phoneNumber && { phone_number: { value: payload.phoneNumber, is_bootstrap: false } }),
    ...(payload.email && { email: { value: payload.email, is_bootstrap: false } }),
  };

  const response = await fpRequest({
    url: '/hosted/identify/signup_challenge',
    method: 'POST',
    data,
    headers: {
      'X-Onboarding-Config-Key': options.obConfigKey,
      'X-Sandbox-Id': options.sandboxId,
      'X-Fp-Is-Components-Sdk': 'true',
    },
  });
  return response;
};

const verify = async (payload, options) => {
  const response = await fpRequest({
    url: '/hosted/identify/verify',
    method: 'POST',
    data: {
      challenge_response: payload.challenge,
      challenge_token: payload.challengeToken,
      scope: 'onboarding',
    },
    headers: {
      'X-Fp-Authorization': options.token,
    },
  });
  return response.data;
};

export const getValidationToken = async options => {
  const response = await fpRequest({
    url: '/hosted/identify/validation_token',
    method: 'POST',
    headers: {
      'X-Fp-Authorization': options.token,
    },
  });
  return response;
};

export const initOnboarding = async options => {
  const response = await fpRequest({
    url: '/hosted/onboarding',
    method: 'POST',
    data: {
      fixture_result: 'pass',
    },
    headers: {
      'X-Fp-Authorization': options.token,
    },
  });
  return response;
};

export const createVaultingToken = async ({ authToken }) => {
  const response = await fpRequest({
    url: '/hosted/user/tokens',
    method: 'POST',
    headers: {
      'X-Fp-Authorization': authToken,
    },
    data: {
      requested_scope: 'onboarding_components',
    },
  });
  return response;
};

export const verifyChallenge = async (payload, options) => {
  const response = await verify(payload, options);
  await getValidationToken({ token: response.auth_token });
  await initOnboarding({ token: response.auth_token });
  // const vaultingToken = await createVaultingToken({ authToken: response.auth_token });

  return {
    authToken: response.auth_token,
    // vaultingToken: vaultingToken.token,
  };
};
