import { mockRequest, screen, selectEvents, userEvent, waitFor, within } from '@onefootprint/test-utils';
import type { BusinessOwner, DataIdentifier, Entity, Timeline, VaultValue } from '@onefootprint/types';
import {
  ActorKind,
  BusinessDI,
  CollectedKybDataOption,
  CollectedKycDataOption,
  DataKind,
  DecisionStatus,
  EntityKind,
  EntityStatus,
  TimelineEventKind,
  WorkflowKind,
} from '@onefootprint/types';

const defaultAttribute = {
  source: 'user',
  dataKind: DataKind.vaultData,
  transforms: {},
};

export const entityFixture: Entity = {
  id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
  isIdentifiable: true,
  kind: EntityKind.business,
  data: [
    { ...defaultAttribute, identifier: BusinessDI.addressLine1, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.city, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.country, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.name, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.doingBusinessAs, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.phoneNumber, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.state, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.tin, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.website, isDecryptable: true, value: null },
    { ...defaultAttribute, identifier: BusinessDI.zip, isDecryptable: true, value: null },
  ],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
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
  requiresManualReview: false,
  status: EntityStatus.pass,
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  label: null,
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
          CollectedKybDataOption.kycedBeneficialOwners,
          CollectedKybDataOption.tin,
        ],
        isPrefill: false,
      },
    },
    timestamp: '2023-04-05T11:16:13.599001Z',
    seqno: 1,
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
            kind: ActorKind.footprint,
          },
          workflowKind: WorkflowKind.Kyc,
          obConfiguration: {
            id: 'ob_config_id_3o5SdynZVGO1icDm8Z6llC',
            name: 'My Playbook',
            mustCollectData: [
              CollectedKybDataOption.name,
              CollectedKybDataOption.address,
              CollectedKybDataOption.tin,
              CollectedKybDataOption.kycedBeneficialOwners,
              CollectedKycDataOption.name,
              CollectedKycDataOption.address,
              CollectedKycDataOption.phoneNumber,
              CollectedKycDataOption.dob,
              CollectedKycDataOption.ssn4,
            ],
          },
          vendors: [],
          ranRulesInSandbox: false,
        },
        annotation: null,
        workflowSource: 'hosted',
      },
    },
    timestamp: '2023-04-05T11:17:06.776409Z',
    seqno: 2,
  },
];

export const businessOwnersFixture: BusinessOwner[] = [
  {
    fpId: 'fp_id_XW3pNYPpV4Niup1PgFZBg6',
    status: EntityStatus.pass,
    ownershipStake: 50,
    kind: 'primary',
  },
  { ownershipStake: 50, kind: 'secondary' },
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

export const withAuthEvents = (entity = entityFixture, response = []) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/auth_events`,
    response,
  });

export const withAnnotations = (entity = entityFixture, response = []) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/annotations`,
    response,
  });

export const withBusinessOwners = (entity = entityFixture) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/business_owners`,
    response: businessOwnersFixture,
  });

export const withEntityDecrypt = (entityId: string, decryptedData: Partial<Record<DataIdentifier, VaultValue>>) =>
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
    expect(screen.getByRole('dialog', { name: 'Decrypt data' })).toBeInTheDocument();
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
