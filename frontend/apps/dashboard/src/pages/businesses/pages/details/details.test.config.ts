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
  DecisionSourceKind,
  DecisionStatus,
  Entity,
  EntityKind,
  EntityStatus,
  OnboardingStatus,
  RoleScope,
  Timeline,
  TimelineEventKind,
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
      timestamp: '2023-04-03T17:42:30.799202Z',
      ipAddress: '67.243.21.56',
      city: 'New York',
      country: 'United States',
      region: 'NY',
      regionName: 'New York',
      latitude: 40.7365,
      longitude: -74.0055,
      metroCode: '501',
      postalCode: '10014',
      timeZone: 'America/New_York',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15',
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

export const timelineFixture: Timeline = [
  {
    event: {
      kind: TimelineEventKind.dataCollected,
      data: {
        attributes: [
          CollectedKybDataOption.name,
          CollectedKybDataOption.phoneNumber,
          CollectedKybDataOption.website,
          CollectedKybDataOption.address,
          CollectedKybDataOption.beneficialOwners,
          CollectedKybDataOption.tin,
        ],
      },
    },
    timestamp: '2023-04-05T11:16:13.599001Z',
    isFromOtherOrg: false,
  },
  {
    event: {
      kind: TimelineEventKind.onboardingDecision,
      data: {
        decision: {
          id: 'decision_ukUpX59i8VJZiuk6boskdR',
          status: DecisionStatus.pass,
          timestamp: new Date('2023-04-05T11:17:06.773951Z'),
          source: {
            kind: DecisionSourceKind.footprint,
          },
          obConfiguration: {
            mustCollectData: [
              CollectedKybDataOption.name,
              CollectedKybDataOption.address,
              CollectedKybDataOption.tin,
              CollectedKybDataOption.beneficialOwners,
              CollectedKycDataOption.name,
              CollectedKycDataOption.fullAddress,
              CollectedKycDataOption.phoneNumber,
              CollectedKycDataOption.dob,
              CollectedKycDataOption.ssn4,
            ],
            mustCollectIdentityDocument: false,
          },
          vendors: [],
        },
        annotation: null,
      },
    },
    timestamp: '2023-04-05T11:17:06.776409Z',
    isFromOtherOrg: false,
  },
];

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

export const withTimeline = (
  entity = entityFixture,
  response = timelineFixture,
) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/timeline`,
    response,
  });

export const withRiskSignals = (entity = entityFixture, response = []) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/risk_signals`,
    response,
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

export const getTextByRow = ({
  name,
  value,
  container,
}: {
  name: string;
  value: string;
  container: HTMLElement;
}) => {
  const row = within(container).getByRole('row', { name });
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
