import {
  mockRequest,
  screen,
  selectEvents,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import {
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
  DecisionSourceKind,
  DecisionStatus,
  IdDI,
  InvestorProfileDI,
  OnboardingStatus,
  RiskSignal,
  RiskSignalSeverity,
  RoleScope,
  ScopedUser,
  SignalAttribute,
} from '@onefootprint/types';

export const riskSignalsFixture: RiskSignal[] = [
  {
    id: 'sig_ryxauTlDX8hIm3wVRmm',
    severity: RiskSignalSeverity.Low,
    scopes: [SignalAttribute.phoneNumber],
    reasonCode: 'phone_number_located_is_voip',
    note: 'VOIP phone number',
    description:
      "The consumer's phone number could be tied to an answering service, page, or VoIP.",
    onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
    timestamp: '2022-10-24T21:56:12.682238Z',
  },
  {
    id: 'sig_sh610Ggqf7xUOkBSUL8NcC',
    onboardingDecisionId: 'decision_d4uTQ1FIh6cKvDxeRJzyZK',
    reasonCode: 'email_domain_corporate',
    note: 'Corporate email domain',
    description:
      'The domain of the email address has been identified as belonging to a corporate entity.',
    severity: RiskSignalSeverity.Low,
    scopes: [SignalAttribute.email],
    timestamp: '2022-10-24T21:56:12.682238Z',
  },
];

export const userFixture: ScopedUser = {
  id: 'fp_id_rybIhIjSPky1yEZ7u77cok',
  isPortable: true,
  attributes: [
    IdDI.email,
    IdDI.firstName,
    IdDI.lastName,
    IdDI.phoneNumber,
    IdDI.dob,
    IdDI.ssn4,
    IdDI.ssn9,
    IdDI.country,
    IdDI.city,
    IdDI.state,
    IdDI.addressLine1,
    IdDI.zip,
    InvestorProfileDI.occupation,
    InvestorProfileDI.employedByBrokerageFirm,
    InvestorProfileDI.annualIncome,
    InvestorProfileDI.netWorth,
    InvestorProfileDI.investmentGoals,
    InvestorProfileDI.riskTolerance,
    InvestorProfileDI.declarations,
    InvestorProfileDI.complianceLetter,
  ],
  identityDocumentInfo: [],
  startTimestamp: '2023-02-04T00:02:09.690721Z',
  onboarding: {
    id: 'ob_HpQ61LblrLgXnx764kaE8F',
    isAuthorized: true,
    name: 'User ID verification',
    configId: 'ob_config_id_HPuJsnhKSX4GwuK6FXG9F3',
    requiresManualReview: false,
    status: OnboardingStatus.verified,
    timestamp: '2023-02-04T00:02:12.743759Z',
    isLivenessSkipped: false,
    insightEvent: {
      timestamp: '2023-02-04T00:02:12.731594Z',
      ipAddress: '76.27.42.222',
      city: 'Sandy',
      country: 'United States',
      region: 'UT',
      regionName: 'Utah',
      latitude: 40.576,
      longitude: -111.8788,
      metroCode: '770',
      postalCode: '84070',
      timeZone: 'America/Denver',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    },
    canAccessData: [
      CollectedKycDataOption.name,
      CollectedKycDataOption.dob,
      CollectedKycDataOption.ssn4,
      CollectedKycDataOption.ssn9,
      CollectedKycDataOption.fullAddress,
      CollectedKycDataOption.email,
      CollectedKycDataOption.phoneNumber,
      CollectedInvestorProfileDataOption.investorProfile,
    ],
    canAccessAttributes: [
      IdDI.email,
      IdDI.firstName,
      IdDI.lastName,
      IdDI.addressLine1,
      IdDI.city,
      IdDI.zip,
      IdDI.country,
      IdDI.phoneNumber,
      IdDI.dob,
      IdDI.ssn4,
      IdDI.ssn9,
      InvestorProfileDI.occupation,
      InvestorProfileDI.employedByBrokerageFirm,
      InvestorProfileDI.annualIncome,
      InvestorProfileDI.netWorth,
      InvestorProfileDI.investmentGoals,
      InvestorProfileDI.riskTolerance,
      InvestorProfileDI.declarations,
      InvestorProfileDI.complianceLetter,
    ],
    canAccessPermissions: [
      RoleScope.decryptEmail,
      RoleScope.decryptName,
      RoleScope.decryptFullAddress,
      RoleScope.decryptPhoneNumber,
      RoleScope.decryptDob,
      RoleScope.decryptSsn4,
      RoleScope.decryptSsn9,
      RoleScope.decryptDocuments,
      RoleScope.decryptInvestorProfile,
    ],
    latestDecision: {
      id: 'decision_sjlbjqkdSFdShDCiPHgK6K',
      status: DecisionStatus.pass,
      timestamp: new Date('2023-02-04T00:02:48.954578Z'),
      source: {
        kind: DecisionSourceKind.footprint,
      },
      vendors: [],
      obConfiguration: {
        mustCollectData: [],
        mustCollectIdentityDocument: false,
      },
    },
  },
  orderingId: 7076,
};

export const withRiskSignals = (
  userId: string,
  response: RiskSignal[] = riskSignalsFixture,
) =>
  mockRequest({
    method: 'get',
    path: `/entities/${userId}/risk_signals`,
    response,
  });

export const withUser = (userId: string, response: ScopedUser = userFixture) =>
  mockRequest({
    method: 'get',
    path: `/users/${userId}`,
    response,
  });

export const withUserDecrypt = (
  userId: string,
  response: Record<string, string | undefined>,
) =>
  mockRequest({
    method: 'post',
    path: `/entities/${userId}/vault/decrypt`,
    response,
  });

export const getTextByRow = (name: string, value: string) => {
  const row = screen.getByRole('row', {
    name,
  });
  return within(row).getByText(value);
};

export const selectDecryptReasonAndContinue = async () => {
  await waitFor(() => {
    expect(
      screen.getByRole('dialog', { name: 'Decrypt data' }),
    ).toBeInTheDocument();
  });

  const dialog = screen.getByRole('dialog', { name: 'Decrypt data' });

  const trigger = within(dialog).getByRole('button', {
    name: 'Select...',
  });
  await selectEvents.select(trigger, 'Verifying customer identity');

  const submitButton = within(dialog).getByRole('button', {
    name: 'Continue',
  });
  await userEvent.click(submitButton);
};
