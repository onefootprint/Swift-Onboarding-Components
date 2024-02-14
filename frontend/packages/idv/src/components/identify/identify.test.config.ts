import {
  mockRequest,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { OnboardingConfigStatus } from '@onefootprint/types';

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
  jest
    .spyOn(getBiometricChallengeResponse, 'default')
    .mockImplementation(mockGenerateBiometricResponse);

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

export const withIdentify = (
  userFound?: boolean,
  availableChallengeKinds?: string[],
  isUnverified?: boolean,
) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify',
    response: {
      user: userFound && {
        isUnverified: isUnverified ?? false,
        availableChallengeKinds: availableChallengeKinds ?? [
          'sms',
          'biometric',
        ],
        hasSyncablePasskey: true,
        scrubbedPhoneNumber: '+1 (•••) •••-••99',
      },
    },
  });

export const withLoginChallenge = (challengeKind: string) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/login_challenge',
    response: {
      challengeData: {
        scrubbedPhoneNumber: '+1 (•••) •••-••99',
        biometricChallengeJson: {},
        challengeToken: 'token',
        challengeKind,
      },
    },
  });

export const withSignupChallenge = (challengeKind?: string) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/signup_challenge',
    response: {
      challengeData: {
        scrubbedPhoneNumber: '+1 (•••) •••-••99',
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
  await userEvent.click(screen.getByText('Verify with SMS'));
};

export const fillChallengePin = async () => {
  // Wait until the login challenge request succeeds
  await waitFor(() => {
    expect(screen.getByRole('presentation')).toHaveAttribute(
      'data-pending',
      'false',
    );
  });
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
    expect(
      screen.getByText(
        isNoPhone ? 'Verify your email address' : 'Verify your phone number',
      ),
    ).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.queryByText('Welcome back! 🎉')).toBeNull();
  });
  await waitFor(() => {
    expect(screen.getByTestId('navigation-close-button')).toBeInTheDocument();
  });
  await fillChallengePin();
};

export const bootstrapExistingUser = async () => {
  await waitFor(() => {
    expect(screen.getByText('Welcome back! 🎉')).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.getByTestId('navigation-close-button')).toBeInTheDocument();
  });
  await fillChallengePin();
};

export const bootstrapExistingUserWithPasskey = async () => {
  await waitFor(() => {
    expect(screen.getByText('Welcome back! 🎉')).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.getByTestId('navigation-close-button')).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.getByText('Log in with passkey')).toBeInTheDocument();
  });
  await userEvent.click(screen.getByText('Continue'));
};

export const expectShimmer = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('identify-init-shimmer')).toBeInTheDocument();
  });
};
