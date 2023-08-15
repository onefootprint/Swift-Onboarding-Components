import {
  mockRequest,
  screen,
  selectEvents,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import {
  ActorKind,
  CollectedKycDataOption,
  DataIdentifier,
  DecisionStatus,
  DocumentDI,
  Entity,
  EntityKind,
  EntityStatus,
  IdDI,
  InvestorProfileDI,
  Liveness,
  LivenessSource,
  Timeline,
  TimelineEventKind,
  VaultValue,
  Vendor,
  WatchlistCheckStatus,
} from '@onefootprint/types';

export const entityFixture: Entity = {
  id: 'fp_id_wL6XIWe26cRinucZrRK1yn',
  isPortable: true,
  kind: EntityKind.person,
  requiresManualReview: false,
  status: EntityStatus.pass,
  attributes: [
    IdDI.phoneNumber,
    IdDI.email,
    IdDI.firstName,
    IdDI.lastName,
    IdDI.country,
    IdDI.addressLine1,
    IdDI.ssn9,
    IdDI.ssn4,
    IdDI.dob,
    IdDI.nationality,
    IdDI.state,
    IdDI.city,
    IdDI.zip,
    InvestorProfileDI.occupation,
    InvestorProfileDI.annualIncome,
    InvestorProfileDI.netWorth,
    InvestorProfileDI.riskTolerance,
    InvestorProfileDI.investmentGoals,
    InvestorProfileDI.declarations,
    DocumentDI.finraComplianceLetter,
    'card.primary.issuer',
    'card.primary.number',
    'card.primary.expiration',
    'card.primary.cvc',
    'card.primary.number_last4',
    'card.primary.name',
  ],
  decryptableAttributes: [
    IdDI.phoneNumber,
    IdDI.email,
    IdDI.firstName,
    IdDI.lastName,
    IdDI.country,
    IdDI.addressLine1,
    IdDI.ssn9,
    IdDI.ssn4,
    IdDI.dob,
    IdDI.nationality,
    IdDI.state,
    IdDI.city,
    IdDI.zip,
    InvestorProfileDI.occupation,
    InvestorProfileDI.annualIncome,
    InvestorProfileDI.netWorth,
    InvestorProfileDI.riskTolerance,
    InvestorProfileDI.investmentGoals,
    InvestorProfileDI.declarations,
    DocumentDI.finraComplianceLetter,
    'card.primary.issuer',
    'card.primary.number',
    'card.primary.expiration',
    'card.primary.cvc',
    'card.primary.number_last4',
    'card.primary.name',
  ],
  startTimestamp: '2023-03-29T23:07:44.435194Z',
  insightEvent: {
    timestamp: '2023-03-29T23:07:46.850237Z',
    ipAddress: '73.222.157.30',
    city: 'San Francisco',
    country: 'United States',
    region: 'CA',
    regionName: 'California',
    latitude: 37.7595,
    longitude: -122.4367,
    metroCode: '807',
    postalCode: '94114',
    timeZone: 'America/Los_Angeles',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
  },
  decryptedAttributes: {},
  watchlistCheck: null,
};

export const livenessFixture: Liveness[] = [
  {
    source: LivenessSource.skipped,
    attributes: null,
    insightEvent: {
      timestamp: '2023-03-29T23:08:33.147280Z',
      ipAddress: '73.222.157.30',
      city: 'San Francisco',
      country: 'United States',
      region: 'CA',
      regionName: 'California',
      latitude: 37.7595,
      longitude: -122.4367,
      metroCode: '807',
      postalCode: '94114',
      timeZone: 'America/Los_Angeles',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    },
  },
];

export const timelineFixture: Timeline = [
  {
    event: {
      kind: TimelineEventKind.dataCollected,
      data: {
        attributes: [CollectedKycDataOption.phoneNumber],
      },
    },
    timestamp: '2023-03-29T23:07:44.493561Z',
    isFromOtherOrg: false,
  },
  {
    event: {
      kind: TimelineEventKind.dataCollected,
      data: {
        attributes: [CollectedKycDataOption.email],
      },
    },
    timestamp: '2023-03-29T23:07:44.854515Z',
    isFromOtherOrg: false,
  },
  {
    event: {
      kind: TimelineEventKind.dataCollected,
      data: {
        attributes: [
          CollectedKycDataOption.dob,
          CollectedKycDataOption.fullAddress,
          CollectedKycDataOption.ssn9,
          CollectedKycDataOption.name,
        ],
      },
    },
    timestamp: '2023-03-29T23:08:13.960464Z',
    isFromOtherOrg: false,
  },
  {
    event: {
      kind: TimelineEventKind.onboardingDecision,
      data: {
        decision: {
          id: 'decision_0tNR5dWi8JAdbRP7DO9xxC',
          status: DecisionStatus.pass,
          timestamp: new Date('2023-03-29T23:08:36.755235Z'),
          source: {
            kind: ActorKind.footprint,
          },
          obConfiguration: {
            mustCollectData: [],
            mustCollectIdentityDocument: false,
          },
          vendors: [Vendor.idology, Vendor.twilio],
        },
        annotation: null,
      },
    },
    timestamp: '2023-03-29T23:08:36.768054Z',
    isFromOtherOrg: false,
  },
  {
    event: {
      kind: TimelineEventKind.watchlistCheck,
      data: {
        id: 'wc_DLq34gSJIoO9xSgwwrlZaI',
        status: WatchlistCheckStatus.pass,
        reasonCodes: [],
      },
    },
    timestamp: '2023-03-30T00:15:27.173615Z',
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

export const withLiveness = (
  entity = entityFixture,
  response = livenessFixture,
) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/liveness`,
    response,
  });

export const withDecrypt = (
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

export const withAnnotations = (entity = entityFixture, response = []) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/annotations`,
    response,
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
  return within(row).getByText(value, { exact: false });
};

export const decryptFields = async (fields: string[]) => {
  await waitFor(() => {
    screen.getByRole('button', {
      name: 'Decrypt data',
    });
  });
  const decryptButton = screen.getByRole('button', {
    name: 'Decrypt data',
  });
  await userEvent.click(decryptButton);

  await Promise.all(
    fields.map(async name => {
      const [field] = screen.getAllByRole('checkbox', {
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
