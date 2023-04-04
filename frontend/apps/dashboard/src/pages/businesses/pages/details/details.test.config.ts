import {
  mockRequest,
  screen,
  selectEvents,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import {
  BusinessDI,
  CollectedKybDataOption,
  CollectedKycDataOption,
  DataIdentifier,
  Entity,
  EntityKind,
  EntityStatus,
  OnboardingStatus,
  RoleScope,
  VaultValue,
} from '@onefootprint/types';

export const entityFixture: Entity = {
  id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
  isPortable: true,
  kind: EntityKind.business,
  attributes: [
    BusinessDI.city,
    BusinessDI.name,
    BusinessDI.tin,
    BusinessDI.website,
    BusinessDI.addressLine1,
    BusinessDI.phoneNumber,
    BusinessDI.zip,
    BusinessDI.country,
    BusinessDI.state,
    BusinessDI.tin,
  ],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  onboarding: {
    id: 'ob_Y3gPIFuPyhqK4f9w2f8QF7',
    isAuthorized: true,
    name: '[Test] Business',
    configId: 'ob_config_id_RccCUPbZVaarmtjfNwM9vo',
    requiresManualReview: false,
    status: OnboardingStatus.verified,
    timestamp: '2023-03-27T14:43:47.446874Z',
    isLivenessSkipped: false,
    insightEvent: {
      timestamp: '2023-03-27T14:43:47.418406Z',
      ipAddress: '191.251.92.92',
      city: 'Florian%C3%B3polis',
      country: 'Brazil',
      region: 'SC',
      regionName: 'Santa Catarina',
      latitude: -27.6147,
      longitude: -48.4976,
      postalCode: '88000',
      timeZone: 'America/Sao_Paulo',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
    },
    canAccessPermissions: [
      RoleScope.decryptName,
      RoleScope.decryptDob,
      RoleScope.decryptSsn9,
      RoleScope.decryptFullAddress,
      RoleScope.decryptEmail,
      RoleScope.decryptPhoneNumber,
      RoleScope.decryptBusinessName,
      RoleScope.decryptBusinessTin,
      RoleScope.decryptBusinessAddress,
      RoleScope.decryptBusinessPhoneNumber,
      RoleScope.decryptBusinessWebsite,
    ],
    canAccessData: [
      CollectedKycDataOption.name,
      CollectedKycDataOption.dob,
      CollectedKycDataOption.ssn9,
      CollectedKycDataOption.fullAddress,
      CollectedKycDataOption.email,
      CollectedKycDataOption.phoneNumber,
      CollectedKybDataOption.name,
      CollectedKybDataOption.tin,
      CollectedKybDataOption.address,
      CollectedKybDataOption.phoneNumber,
      CollectedKybDataOption.website,
    ],
    canAccessAttributes: [],
  },
  requiresManualReview: false,
  status: EntityStatus.pass,
  decryptedAttributes: {
    [BusinessDI.name]: 'Acme Inc.',
  },
};

export const withEntity = (entity = entityFixture) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}`,
    response: {
      ...entity,
    },
  });

export const withEntityError = (entityId = entityFixture.id) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entityId}`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withRiskSignals = (entity = entityFixture) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/risk_signals`,
    response: [],
  });

export const withRiskSignalsError = () =>
  mockRequest({
    method: 'get',
    path: '/entities/fp_id_yCZehsWNeywHnk5JqL20u/risk_signals',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withEntityDecrypt = (
  entityId: string,
  decryptedData: Partial<Record<DataIdentifier, VaultValue>>,
) =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityId}/vault/decrypt`,
    response: {
      ...decryptedData,
    },
  });

export const getTextByRow = (name: string, value: string) => {
  const row = screen.getByRole('row', { name });
  return within(row).getByText(value);
};

export const decryptFields = async (fields: string[]) => {
  const decryptButton = screen.getByRole('button', {
    name: 'Decrypt data',
  });
  await userEvent.click(decryptButton);

  await Promise.all(
    fields.map(async name => {
      const field = screen.getByRole('checkbox', {
        name,
      });
      await userEvent.click(field);
    }),
  );

  const nextButton = screen.getByRole('button', {
    name: 'Next',
  });
  await userEvent.click(nextButton);

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
    name: 'Next',
  });
  await userEvent.click(submitButton);
};
