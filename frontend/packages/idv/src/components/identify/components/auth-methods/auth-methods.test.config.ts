import { mockRequest, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { AuthMethodKind, ChallengeKind } from '@onefootprint/types';

export const withUserAuthMethods = (data?: unknown) =>
  mockRequest({
    method: 'get',
    path: '/hosted/user/auth_methods',
    response: data || [
      { kind: 'phone', is_verified: true, can_update: true },
      { kind: 'email', is_verified: true, can_update: true },
    ],
  });

export const withUserVaultDecrypt = (data?: unknown) =>
  mockRequest({
    method: 'post',
    path: '/hosted/user/vault/decrypt',
    response: data || {
      'id.phone_number': '+15555550100',
      'id.email': 'sandbox@onefootprint.com',
    },
  });

export const withUserChallenge = (data?: unknown) =>
  mockRequest({
    method: 'post',
    path: '/hosted/user/challenge',
    response: data || {
      biometric_challenge_json: null,
      challenge_token: 'omFumBgYtRhaGHcYg...',
      time_before_retry_s: 8,
    },
  });

export const withUserChallengeVerify = (data?: unknown) =>
  mockRequest({
    method: 'post',
    path: '/hosted/user/challenge/verify',
    response: data || {},
  });

export const withIdentify = (
  userFound?: boolean,
  challengeKinds?: string[],
  isUnverified?: boolean,
  tokenScopes?: string[],
) => {
  const availableChallengeKinds = challengeKinds ?? ['sms', 'biometric'];
  const authMethodKind: Record<string, string> = {
    [ChallengeKind.biometric]: AuthMethodKind.passkey,
    [ChallengeKind.sms]: AuthMethodKind.phone,
    [ChallengeKind.email]: AuthMethodKind.email,
  };
  const authMethods = availableChallengeKinds.map(k => ({
    kind: authMethodKind[k],
    isVerified: true,
  }));
  return mockRequest({
    method: 'post',
    path: '/hosted/identify',
    response: {
      user: userFound && {
        isUnverified: isUnverified ?? false,
        availableChallengeKinds,
        authMethods,
        hasSyncablePasskey: true,
        scrubbedPhoneNumber: '+1 (•••) •••-••99',
        tokenScopes: tokenScopes ?? [],
      },
    },
  });
};

export const fillChallengePin = async () => {
  // Wait until the login challenge request succeeds
  await waitFor(() => {
    expect(screen.getByRole('presentation')).toHaveAttribute('data-pending', 'false');
  });
  // expect(screen.getByTestId('navigation-back-button')).toBeInTheDocument();
  const firstInput = document.getElementsByTagName('input')[0];
  expect(firstInput).toBeInTheDocument();
  await waitFor(() => {
    expect(document.activeElement === firstInput).toBeTruthy();
  });

  await userEvent.keyboard('123456');
  await waitFor(() => {
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });
};
