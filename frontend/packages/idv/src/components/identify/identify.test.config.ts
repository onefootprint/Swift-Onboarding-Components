import { mockRequest, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { AuthMethodKind, ChallengeKind, IdDI, OnboardingConfigStatus } from '@onefootprint/types';

import * as getBiometricChallengeResponse from '../../utils/get-biometric-challenge-response';

// This needs to be mocked here and in the test itself as it is a esModule
jest.mock('../../utils/get-biometric-challenge-response', () => ({
  __esModule: true,
  ...jest.requireActual('../../utils/get-biometric-challenge-response'),
}));

const mockGenerateBiometricResponse = (): Promise<string> =>
  new Promise(resolve => {
    resolve(
      '{"rawId":"rawId","id":"id","type":"public-key","response":{"clientDataJSON":{},"authenticatorData":{},"signature":"signature"}}',
    );
  });

export const mockGetBiometricChallengeResponse = () =>
  jest.spyOn(getBiometricChallengeResponse, 'default').mockImplementation(mockGenerateBiometricResponse);

export const getOnboardingConfig = (isLive?: boolean, noPhone?: boolean) => ({
  name: 'Acme Bank',
  key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
  orgName: 'Acme Bank',
  orgId: 'orgId',
  logoUrl: null,
  privacyPolicyUrl: null,
  isLive: !!isLive,
  status: OnboardingConfigStatus.enabled,
  isAppClipEnabled: true,
  isInstantAppEnabled: true,
  appClipExperienceId: 'exp_xxx',
  isNoPhoneFlow: !!noPhone,
  requiresIdDoc: false,
  isKyb: false,
  allowInternationalResidents: false,
  requiredAuthMethods: [noPhone ? AuthMethodKind.email : AuthMethodKind.phone],
});

export const liveOnboardingConfigFixture = getOnboardingConfig(true);
export const sandboxOnboardingConfigFixture = getOnboardingConfig(false);
export const noPhoneOnboardingConfigFixture = getOnboardingConfig(true, true);

export const withOnboardingConfig = (data = sandboxOnboardingConfigFixture) =>
  mockRequest({
    method: 'get',
    path: '/hosted/onboarding/config',
    response: data,
  });

export const withIdentifyError = () =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify',
    statusCode: 400,
    response: {},
  });

export const withIdentify = (context?: {
  challengeKinds?: string[];
  isUnverified?: boolean;
  tokenScopes?: string[];
  matchingFps?: string[];
}) => {
  const userFound = !!context;
  const { challengeKinds, isUnverified, tokenScopes, matchingFps } = context ?? {};
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
      user: userFound
        ? {
            token: 'utok_xxx',
            isUnverified: isUnverified ?? false,
            availableChallengeKinds,
            authMethods,
            hasSyncablePasskey: true,
            scrubbedPhone: '+1 (***) ***-**99',
            tokenScopes: tokenScopes ?? [],
            matchingFps: matchingFps ?? [IdDI.phoneNumber],
          }
        : undefined,
    },
  });
};

export const withLoginChallenge = (challengeKind: string) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/login_challenge',
    response: {
      challengeData: {
        token: 'utok_xxx',
        scrubbedPhoneNumber: '+1 (***) ***-**99',
        biometricChallengeJson: {},
        challengeToken: 'token',
        challengeKind,
      },
    },
  });

export const withSignupChallenge = (challengeKind?: string, onRequest?: (args: unknown) => void) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/signup_challenge',
    onRequest,
    response: {
      challengeData: {
        token: 'utok_xxx',
        scrubbedPhoneNumber: '+1 (***) ***-**99',
        challengeToken: 'token',
        challengeKind: challengeKind ?? 'sms',
      },
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

export const withKba = () =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/kba',
    response: {
      token: 'new-token-2',
    },
  });

export const withUserChallenge = () =>
  mockRequest({
    method: 'post',
    path: '/hosted/user/challenge',
    response: {
      challengeToken: 'token',
      timeBeforeRetryS: 1,
    },
  });

export const withUserChallengeVerify = () =>
  mockRequest({
    method: 'post',
    path: '/hosted/user/challenge/verify',
    response: {},
  });

export const withUserVault = () =>
  mockRequest({
    method: 'patch',
    path: '/hosted/user/vault',
    response: {
      data: {
        data: 'success',
      },
    },
  });

export const fillIdentifyEmail = async () => {
  await waitFor(() => {
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
  const emailField = screen.getByLabelText('Email');
  await userEvent.type(emailField, 'piip@onefootprint.com');
  await userEvent.click(screen.getByText('Continue'));
};

export const fillIdentifyPhone = async () => {
  await waitFor(() => {
    expect(screen.getByText('Phone number')).toBeInTheDocument();
  });
  const inputPhone = screen.getByText('Phone number');
  await userEvent.type(inputPhone, '6504600799');
  await userEvent.click(screen.getByText('Continue'));
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

export const bootstrapNewUser = async (isNoPhone: boolean) => {
  await waitFor(() => {
    expect(screen.getByText(isNoPhone ? 'Verify your email address' : 'Verify your phone number')).toBeInTheDocument();
  });
  expect(screen.queryByText('Welcome back! 🎉')).toBeNull();
  expect(screen.getByTestId('navigation-close-button')).toBeInTheDocument();
  expect(screen.getByText('Log in with a different account')).toBeInTheDocument();
  await fillChallengePin();
};

export const fillChallengePinExistingUser = async () => {
  await waitFor(() => {
    expect(screen.getByText('Welcome back! 🎉')).toBeInTheDocument();
  });
  expect(screen.getByTestId('navigation-back-button')).toBeInTheDocument();
  expect(screen.queryByText('Log in with a different account')).not.toBeInTheDocument();
  await fillChallengePin();
};

export const bootstrapExistingUser = async () => {
  await waitFor(() => {
    expect(screen.getByText('Welcome back! 🎉')).toBeInTheDocument();
  });
  expect(screen.getByTestId('navigation-close-button')).toBeInTheDocument();
  expect(screen.getByText('Log in with a different account')).toBeInTheDocument();
  await fillChallengePin();
};

export const bootstrapExistingUserWithPasskey = async () => {
  await waitFor(() => {
    expect(screen.getByText('Welcome back! 🎉')).toBeInTheDocument();
  });
  expect(screen.getByTestId('navigation-close-button')).toBeInTheDocument();
  expect(screen.getByText('Log in with passkey')).toBeInTheDocument();
  await userEvent.click(screen.getByText('Continue'));
};

export const expectShimmer = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('identify-init-shimmer')).toBeInTheDocument();
  });
};
