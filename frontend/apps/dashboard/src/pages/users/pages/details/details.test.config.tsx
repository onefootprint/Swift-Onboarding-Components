import { mockRequest, screen, userEvent, waitFor, within } from '@onefootprint/test-utils';
import type { AuthEvent, DataIdentifier, Entity, Timeline, VaultValue } from '@onefootprint/types';
import {
  ActorKind,
  AuthEventKind,
  CollectedKycDataOption,
  DataKind,
  DecisionStatus,
  DocumentDI,
  EntityKind,
  EntityStatus,
  IdDI,
  IdentifyScope,
  InvestorProfileDI,
  TimelineEventKind,
  Vendor,
  WatchlistCheckStatus,
  WorkflowKind,
} from '@onefootprint/types';

const defaultAttribute = {
  source: 'user',
  dataKind: DataKind.vaultData,
  transforms: {},
  isDecryptable: true,
  value: null,
};

export const entityFixture: Entity = {
  id: 'fp_id_wL6XIWe26cRinucZrRK1yn',
  isIdentifiable: true,
  kind: EntityKind.person,
  requiresManualReview: false,
  status: EntityStatus.pass,
  attributes: [],
  data: [
    { ...defaultAttribute, identifier: IdDI.phoneNumber },
    { ...defaultAttribute, identifier: IdDI.email },
    { ...defaultAttribute, identifier: IdDI.firstName },
    { ...defaultAttribute, identifier: IdDI.lastName, transforms: { prefix_1: 'D' } },
    { ...defaultAttribute, identifier: IdDI.country },
    { ...defaultAttribute, identifier: IdDI.addressLine1 },
    { ...defaultAttribute, identifier: IdDI.ssn9 },
    { ...defaultAttribute, identifier: IdDI.ssn4 },
    { ...defaultAttribute, identifier: IdDI.dob },
    { ...defaultAttribute, identifier: IdDI.nationality },
    { ...defaultAttribute, identifier: IdDI.state },
    { ...defaultAttribute, identifier: IdDI.city },
    { ...defaultAttribute, identifier: IdDI.zip },
    { ...defaultAttribute, identifier: IdDI.usLegalStatus },
    { ...defaultAttribute, identifier: IdDI.citizenships },
    { ...defaultAttribute, identifier: IdDI.visaKind },
    { ...defaultAttribute, identifier: IdDI.visaExpirationDate },
    { ...defaultAttribute, identifier: InvestorProfileDI.occupation },
    { ...defaultAttribute, identifier: InvestorProfileDI.employmentStatus },
    { ...defaultAttribute, identifier: InvestorProfileDI.annualIncome },
    { ...defaultAttribute, identifier: InvestorProfileDI.netWorth },
    { ...defaultAttribute, identifier: InvestorProfileDI.riskTolerance },
    { ...defaultAttribute, identifier: InvestorProfileDI.investmentGoals },
    { ...defaultAttribute, identifier: InvestorProfileDI.declarations },
    { ...defaultAttribute, identifier: DocumentDI.finraComplianceLetter },
    { ...defaultAttribute, identifier: 'card.primary.issuer' as DataIdentifier },
    { ...defaultAttribute, identifier: 'card.primary.number' as DataIdentifier },
    { ...defaultAttribute, identifier: 'card.primary.expiration' as DataIdentifier },
    { ...defaultAttribute, identifier: 'card.primary.cvc' as DataIdentifier },
    { ...defaultAttribute, identifier: 'card.primary.number_last4' as DataIdentifier },
    { ...defaultAttribute, identifier: 'card.primary.name' as DataIdentifier },
  ],
  startTimestamp: '2023-03-29T23:07:44.435194Z',
  lastActivityAt: '2023-03-27T14:43:47.444716Z',
  workflows: [
    {
      createdAt: '2023-03-27T14:43:47.444716Z',
      playbookId: 'ob_config_id_3o5SdynZVGO1icDm8Z6llC',
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
    },
  ],
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  label: null,
};

export const livenessFixture: AuthEvent[] = [
  {
    kind: AuthEventKind.sms,
    linkedAttestations: [],
    scope: IdentifyScope.onboarding,
    insight: {
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
        isPrefill: false,
      },
    },
    timestamp: '2023-03-29T23:07:44.493561Z',
    seqno: 1,
  },
  {
    event: {
      kind: TimelineEventKind.dataCollected,
      data: {
        attributes: [CollectedKycDataOption.email],
        isPrefill: false,
      },
    },
    timestamp: '2023-03-29T23:07:44.854515Z',
    seqno: 2,
  },
  {
    event: {
      kind: TimelineEventKind.dataCollected,
      data: {
        attributes: [
          CollectedKycDataOption.dob,
          CollectedKycDataOption.address,
          CollectedKycDataOption.ssn9,
          CollectedKycDataOption.name,
        ],
        isPrefill: false,
      },
    },
    timestamp: '2023-03-29T23:08:13.960464Z',
    seqno: 3,
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
          workflowKind: WorkflowKind.Kyc,
          obConfiguration: {
            id: 'ob_config_id_3o5SdynZVGO1icDm8Z6llC',
            name: 'My Playbook',
            mustCollectData: [],
          },
          vendors: [Vendor.idology, Vendor.twilio],
          ranRulesInSandbox: false,
        },
        annotation: null,
      },
    },
    timestamp: '2023-03-29T23:08:36.768054Z',
    seqno: 4,
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
    seqno: 5,
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
      message: 'Something went wrong',
    },
  });

export const withTimeline = (entity = entityFixture, response = timelineFixture) =>
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

export const withDocuments = (entity = entityFixture, response = []) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/documents`,
    response,
  });

export const withAuthEvents = (entity = entityFixture, response = livenessFixture) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/auth_events`,
    response,
  });

export const withDecrypt = (entityId: string, decryptedData: Partial<Record<DataIdentifier, VaultValue>>) =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityId}/vault/decrypt`,
    response: {
      ...decryptedData,
    },
  });

export const withEdit = (entityId: string, response: Partial<Record<DataIdentifier, VaultValue>>) =>
  mockRequest({
    method: 'patch',
    path: `/entities/${entityId}/vault`,
    response,
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

export const getInputByRow = ({
  name,
  container,
}: {
  name: string;
  container: HTMLElement;
}) => {
  const row = within(container).getByRole('row', { name });
  return within(row).getByRole('textbox');
};

export const getSelectOptionByRow = ({
  rowName,
  optionName,
  container,
}: {
  rowName: string;
  optionName: string;
  container: HTMLElement;
}) => {
  const row = within(container).getByRole('row', { name: rowName });
  return within(row).getByRole('option', {
    name: optionName,
  }) as HTMLOptionElement;
};

export const decryptFields = async (fields: string[]) => {
  await waitFor(() => {
    screen.getByRole('button', {
      name: 'Decrypt',
    });
  });
  const decryptButton = screen.getByRole('button', {
    name: 'Decrypt',
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
    expect(screen.getByRole('dialog', { name: 'Decrypt' })).toBeInTheDocument();
  });

  const dialog = screen.getByRole('dialog', { name: 'Decrypt' });

  const submitButton = within(dialog).getByRole('button', {
    name: 'Decrypt',
  });
  await userEvent.click(submitButton);
};

export const openEditView = async () => {
  await waitFor(() => {
    screen.getByRole('button', {
      name: 'Open actions',
    });
  });
  const actionsButton = screen.getByRole('button', {
    name: 'Open actions',
  });
  await userEvent.click(actionsButton);

  const dropdownItem = screen.getByText('Edit user information');
  await userEvent.click(dropdownItem);

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
};
