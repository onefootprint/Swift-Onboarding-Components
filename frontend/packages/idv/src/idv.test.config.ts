import {
  mockRequest,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import {
  ChallengeKind,
  CollectedKycDataOption,
  D2PStatus,
  DataIdentifier,
  OnboardingRequirement,
  OnboardingRequirementKind,
  UserTokenScope,
} from '@onefootprint/types';

export const TestAuthorizeRequirement: OnboardingRequirement = {
  kind: OnboardingRequirementKind.authorize,
  isMet: false,
  fieldsToAuthorize: {
    collectedData: [
      CollectedKycDataOption.name,
      CollectedKycDataOption.dob,
      CollectedKycDataOption.ssn9,
    ],
    documentTypes: [],
  },
};

export const getKycOnboardingConfig = (isLive?: boolean) => ({
  key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
  name: 'Acme Bank',
  org_name: 'Acme Bank',
  logo_url: null,
  is_live: !!isLive,
  status: 'enabled',
  is_no_phone_flow: false,
  requires_id_doc: false,
  is_kyb: false,
  allow_international_residents: false,
});

export const withOnboardingConfig = (data: any) =>
  mockRequest({
    method: 'get',
    path: '/org/onboarding_config',
    response: data,
  });

export const withOnboarding = (onboardingConfig: any) =>
  mockRequest({
    method: 'post',
    path: '/hosted/onboarding',
    response: {
      onboardingConfig,
    },
  });

export const withOnboardingValidate = (validationToken?: string) =>
  mockRequest({
    method: 'post',
    path: '/hosted/onboarding/validate',
    response: {
      validationToken,
    },
  });

const RequirementsFixture: OnboardingRequirement[] = [
  {
    kind: OnboardingRequirementKind.collectKycData,
    isMet: false,
    missingAttributes: [
      CollectedKycDataOption.name,
      CollectedKycDataOption.dob,
      CollectedKycDataOption.ssn9,
    ],
    populatedAttributes: [],
    optionalAttributes: [],
  },
];

const MetRequirementsFixture: OnboardingRequirement[] = [];

export const withRequirements = (
  requirements = RequirementsFixture,
  metRequirements = MetRequirementsFixture,
) => {
  mockRequest({
    method: 'get',
    path: '/hosted/onboarding/status',
    response: {
      requirements,
      metRequirements,
      obConfiguration: getKycOnboardingConfig(true),
    },
  });
};

export const withDecrypt = (
  data: Partial<Record<DataIdentifier, string | undefined>>,
) =>
  mockRequest({
    method: 'post',
    path: '/hosted/user/vault/decrypt',
    response: data,
  });

export const withUserToken = () =>
  mockRequest({
    method: 'get',
    path: '/hosted/user/token',
    response: {
      scopes: [UserTokenScope.sensitiveProfile],
    },
  });

export const withIdentify = (userFound?: boolean) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify',
    response: {
      userFound,
      availableChallengeKinds: [ChallengeKind.biometric],
      hasSyncablePassKey: true,
    },
  });

export const withLoginChallenge = (challengeKind: ChallengeKind) =>
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

export const withUserVaultValidate = () => {
  mockRequest({
    method: 'post',
    path: '/hosted/user/vault/validate',
    response: {
      data: {
        data: 'success',
      },
    },
  });
};

export const withAuthorize = () =>
  mockRequest({
    method: 'post',
    path: '/hosted/onboarding/authorize',
    response: {
      data: {
        data: 'success',
      },
    },
  });

export const withD2PGenerate = () =>
  mockRequest({
    method: 'post',
    path: '/hosted/onboarding/d2p/generate',
    response: {
      data: {
        authToken: 'token',
      },
    },
  });

export const withD2PStatus = (status: D2PStatus) =>
  mockRequest({
    method: 'get',
    path: '/hosted/onboarding/d2p/status',
    response: {
      data: {
        status,
        meta: {},
      },
    },
  });

const fillIdentifyEmail = async () => {
  await waitFor(() => {
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
  const emailField = screen.getByLabelText('Email');
  await userEvent.type(emailField, 'piip@onefootprint.com');
  await userEvent.click(screen.getByText('Continue'));
};

const fillIdentifyPhone = async () => {
  await waitFor(() => {
    expect(screen.getByText('Phone number')).toBeInTheDocument();
  });
  const inputPhone = screen.getByText('Phone number');
  await userEvent.type(inputPhone, '9999999999');
  await userEvent.click(screen.getByText('Continue'));
};

const fillSmsPin = async () => {
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

export const identifyUserByPhone = async () => {
  withIdentify(false);
  await fillIdentifyEmail();

  withIdentify(true);
  withLoginChallenge(ChallengeKind.sms);

  await fillIdentifyPhone();

  await waitFor(() => {
    expect(screen.getByText('Welcome back! 🎉')).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(
      screen.getByText('Enter the 6-digit code sent to +1 (•••) •••-••99.'),
    ).toBeInTheDocument();
  });

  withIdentifyVerify();
  await fillSmsPin();

  await waitFor(() => {
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });
};

export const identifyUserByEmail = async () => {
  withIdentify(true);
  withLoginChallenge(ChallengeKind.sms);
  await fillIdentifyEmail();

  await waitFor(() => {
    expect(screen.getByText('Welcome back! 🎉')).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(
      screen.getByText('Enter the 6-digit code sent to +1 (•••) •••-••99.'),
    ).toBeInTheDocument();
  });

  withIdentifyVerify();
  await fillSmsPin();

  await waitFor(() => {
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });
};

export const identifyNewUser = async () => {
  withIdentify(false);
  await fillIdentifyEmail();

  withIdentify(false);
  withLoginChallenge(ChallengeKind.sms);
  await fillIdentifyPhone();

  await waitFor(() => {
    expect(screen.getByText('Verify your phone number')).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(
      screen.getByText('Enter the 6-digit code sent to +1 (•••) •••-••99.'),
    ).toBeInTheDocument();
  });

  withIdentifyVerify();
  await fillSmsPin();

  await waitFor(() => {
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });
};

export const completeKyc = async () => {
  await waitFor(() => {
    expect(screen.getByText(`Basic Data`)).toBeInTheDocument();
  });
  const firstName = screen.getByLabelText('First name');
  await userEvent.type(firstName, 'Piip');

  const lastName = screen.getByLabelText('Last name');
  await userEvent.type(lastName, 'Foot');

  const dob = screen.getByLabelText('Date of Birth');
  await userEvent.type(dob, '05/23/1996');

  let submitButton = screen.getByRole('button', { name: 'Continue' });
  await userEvent.click(submitButton);

  await waitFor(() => {
    expect(
      screen.getByText("What's your Social Security Number?"),
    ).toBeInTheDocument();
  });

  const ssn4 = screen.getByLabelText('SSN');
  await userEvent.type(ssn4, '123456789');

  submitButton = screen.getByRole('button', { name: 'Continue' });
  await userEvent.click(submitButton);
};

export const confirmKycData = async () => {
  await waitFor(() => {
    expect(screen.getByText('Confirm your personal data')).toBeInTheDocument();
  });

  expect(screen.getByText('Basic data')).toBeInTheDocument();

  expect(screen.getByText('First name')).toBeInTheDocument();
  expect(screen.getByText('Piip')).toBeInTheDocument();

  expect(screen.getByText('Last name')).toBeInTheDocument();
  expect(screen.getByText('Foot')).toBeInTheDocument();

  expect(screen.getByText('Date of birth')).toBeInTheDocument();
  expect(screen.getByText('05/23/1996')).toBeInTheDocument();

  expect(screen.getByText('Identity')).toBeInTheDocument();
  expect(screen.getByText('SSN')).toBeInTheDocument();
  expect(screen.getByText('123-45-6789')).toBeInTheDocument();

  const confirmButton = screen.getByText('Confirm & Continue');
  expect(confirmButton).toBeInTheDocument();
  await userEvent.click(confirmButton);
};

export const authorizeData = async () => {
  await waitFor(() => {
    expect(screen.getByText('Authorize access')).toBeInTheDocument();
  });
  expect(screen.getByText('Name')).toBeInTheDocument();
  expect(screen.getByText('Date of birth')).toBeInTheDocument();
  expect(screen.getByText('SSN')).toBeInTheDocument();

  const authorizeButton = screen.getByRole('button', {
    name: 'Authorize',
  });
  await userEvent.click(authorizeButton);
};

export const checkAdditionalDataRequired = async () => {
  await waitFor(() => {
    expect(screen.getByText('Additional data is required')).toBeInTheDocument();
  });
  await userEvent.click(
    screen.getByRole('button', {
      name: 'Continue',
    }),
  );
};

export const checkComplete = async () => {
  await waitFor(() => {
    expect(screen.getByText('Submission completed!')).toBeInTheDocument();
  });
  expect(
    screen.getByText('Thanks for using Footprint to verify your identity.'),
  ).toBeInTheDocument();
};
