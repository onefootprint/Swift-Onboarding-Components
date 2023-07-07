import {
  mockRequest,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { useEffectOnce } from 'usehooks-ts';

import * as useDeviceInfo from '../../hooks/ui/use-device-info';
import * as getBiometricChallengeResponse from './utils/biometrics/get-biometric-challenge-response';

// This needs to be mocked here and in the test itself as it is a esModule
jest.mock('./utils/biometrics/get-biometric-challenge-response', () => ({
  __esModule: true,
  ...jest.requireActual('./utils/biometrics/get-biometric-challenge-response'),
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

// This needs to be mocked here and in the test itself as it is a esModule
jest.mock('../../hooks/ui/use-device-info', () => ({
  __esModule: true,
  ...jest.requireActual('../../hooks/ui/use-device-info'),
}));

const useDeviceInfoImpl = (onComplete: (deviceInfo: any) => void) => {
  useEffectOnce(() => {
    onComplete({
      type: 'mobile',
      hasSupportForWebauthn: true,
    });
  });
};

export const mockUseDeviceInfo = () =>
  jest.spyOn(useDeviceInfo, 'default').mockImplementation(useDeviceInfoImpl);

export const getOnboardingConfig = (isLive?: boolean) => ({
  id: 'ob_config_id_18RIzpIPRAL3pYlnO4Cgeb',
  key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
  name: 'Acme Bank',
  org_name: 'Acme Bank',
  logo_url: null,
  must_collect_data: ['email', 'phone_number'],
  can_access_data: [],
  is_live: !!isLive,
  created_at: '2022-07-20T01:52:36.984290Z',
  status: 'enabled',
});

export const liveOnboardingConfigFixture = getOnboardingConfig(true);
export const sandboxOnboardingConfigFixture = getOnboardingConfig(false);

export const withOnboardingConfig = (data = sandboxOnboardingConfigFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/onboarding_config',
    response: data,
  });

export const withIdentify = (
  userFound?: boolean,
  availableChallengeKinds?: string[],
) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify',
    response: {
      userFound,
      availableChallengeKinds: availableChallengeKinds ?? ['sms', 'biometric'],
      hasSyncablePassKey: true,
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

export const withSignupChallenge = () =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/signup_challenge',
    response: {
      challengeData: {
        scrubbedPhoneNumber: '+1 (•••) •••-••99',
        challengeToken: 'token',
        challengeKind: 'sms',
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

export const fillSandboxOutcome = async () => {
  await waitFor(() => {
    expect(screen.getByText('Select test outcome')).toBeInTheDocument();
  });
  const testIDField = screen.getByLabelText('Test ID');
  await userEvent.type(testIDField, 'testId');
  await userEvent.click(screen.getByText('Continue'));
};

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
  await userEvent.type(inputPhone, '9999999999');
  await userEvent.click(screen.getByText('Continue'));
};

export const fillSmsPin = async () => {
  // Wait until the login challenge request succeeds
  await waitFor(() => {
    expect(screen.getByRole('presentation')).toHaveAttribute(
      'data-pending',
      'false',
    );
  });

  const firstInput = document.getElementsByTagName('input')[0];
  expect(firstInput).toBeInTheDocument();
  firstInput.focus();
  await userEvent.keyboard('123456');
};

export const bootstrapNewUser = async () => {
  await waitFor(() => {
    expect(screen.getByText('Verify your phone number')).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.getByTestId('navigation-close-button')).toBeInTheDocument();
  });
  await fillSmsPin();
  await waitFor(() => {
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });
};

export const bootstrapExistingUser = async () => {
  await waitFor(() => {
    expect(screen.getByText('Welcome back! 🎉')).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.getByTestId('navigation-close-button')).toBeInTheDocument();
  });
  await fillSmsPin();
  await waitFor(() => {
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });
};

export const bootstrapExistingUserWithPasskey = async () => {
  await waitFor(() => {
    expect(screen.getByText('Welcome back! 🎉')).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.getByTestId('navigation-close-button')).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.getByText('Launch passkey')).toBeInTheDocument();
  });
  await userEvent.click(screen.getByText('Launch passkey'));
};
