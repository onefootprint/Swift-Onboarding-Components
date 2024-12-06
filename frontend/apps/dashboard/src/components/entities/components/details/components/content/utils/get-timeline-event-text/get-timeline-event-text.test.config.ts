import type {
  CollectedDataEvent,
  DocumentUploadedEvent,
  FreeFormNoteEvent,
  LabelAddedEvent,
  LivenessEvent,
  OnboardingDecisionEvent,
  VaultCreatedEvent,
  WatchlistCheckEvent,
  WorkflowTriggeredEvent,
} from '@onefootprint/types';
import {
  ActorKind,
  AuthMethodKind,
  CollectedKycDataOption,
  DecisionStatus,
  DocumentRequestKind,
  EntityLabel,
  IdDocStatus,
  LivenessSource,
  SupportedIdDocTypes,
  TimelineEventKind,
  TriggerKind,
  Vendor,
  WatchlistCheckStatus,
} from '@onefootprint/types';
import type {
  AuthMethodUpdatedEvent,
  ExternalIntegrationCalledEvent,
  StepUpEvent,
  WorkflowStartedEvent,
} from '@onefootprint/types/src/data/timeline';
import {
  AuthMethodAction,
  ExternalIntegrationKind,
  StepUpDocumentKind,
  WorkflowStartedEventKind,
} from '@onefootprint/types/src/data/timeline';

export const livenessEventFixture = {
  event: {
    kind: TimelineEventKind.liveness,
    data: {
      source: LivenessSource.skipped,
      insightEvent: {
        timestamp: '2022-11-08T20:21:49.971354Z',
        ipAddress: '104.28.39.72',
        city: 'Nashua',
        country: 'United States',
        region: 'NH',
        regionName: 'New Hampshire',
        latitude: 42.7628,
        longitude: -71.4674,
        metroCode: '506',
        postalCode: '03061',
        timeZone: 'America/New_York',
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      },
    },
  } as LivenessEvent,
  timestamp: '2022-11-08T20:21:49.979139Z',
  seqno: 1,
};

export const labelAddedEventFixture = {
  event: {
    kind: TimelineEventKind.labelAdded,
    data: {
      kind: EntityLabel.active,
    },
  } as LabelAddedEvent,
  timestamp: '2022-11-08T10:21:33.931738Z',
  seqno: 2,
};

export const dataCollectedEventFixture = {
  event: {
    kind: TimelineEventKind.dataCollected,
    data: {
      attributes: [
        CollectedKycDataOption.name,
        CollectedKycDataOption.dob,
        CollectedKycDataOption.ssn9,
        CollectedKycDataOption.address,
        CollectedKycDataOption.email,
        CollectedKycDataOption.phoneNumber,
      ],
      isPrefill: false,
    },
  } as CollectedDataEvent,
  timestamp: '2022-11-08T20:21:33.931738Z',
  seqno: 3,
};

export const documentUploadedEventFixture = {
  event: {
    kind: TimelineEventKind.documentUploaded,
    data: {
      status: IdDocStatus.pending,
      documentType: SupportedIdDocTypes.idCard,
      config: {
        kind: DocumentRequestKind.Identity,
        data: {
          collectSelfie: false,
        },
      },
    },
  } as DocumentUploadedEvent,
  timestamp: '2022-11-08T20:21:33.931738Z',
  seqno: 4,
};

export const onboardingDecisionEventFixture = {
  event: {
    kind: TimelineEventKind.onboardingDecision,
    data: {
      decision: {
        id: 'decision_1',
        status: DecisionStatus.pass,
        timestamp: new Date('2022-11-08T20:21:53.769699Z'),
        source: {
          kind: ActorKind.footprint,
        },
        obConfiguration: {
          id: 'ob_config_1',
          name: 'My Playbook',
          mustCollectData: [CollectedKycDataOption.name, CollectedKycDataOption.dob, CollectedKycDataOption.ssn9],
        },
        vendors: [Vendor.idology],
        ranRulesInSandbox: false,
      },
      annotation: null,
    },
  } as OnboardingDecisionEvent,
  timestamp: '2022-11-08T20:21:33.931738Z',
  seqno: 4,
};

export const watchlistCheckEventFixture = {
  event: {
    kind: TimelineEventKind.watchlistCheck,
    data: {
      id: '1',
      reasonCodes: ['watchlist_hit_ofac'],
      status: WatchlistCheckStatus.fail,
    },
  } as WatchlistCheckEvent,
  timestamp: '2022-11-08T20:21:33.931738Z',
  seqno: 4,
};

export const freeFormNoteEventFixture = {
  event: {
    kind: TimelineEventKind.freeFormNote,
    data: {
      id: 'annotation_1',
      note: 'some note',
      isPinned: false,
      source: {
        kind: ActorKind.footprint,
      },
      timestamp: '2022-11-08T20:21:33.931738Z',
    },
  } as FreeFormNoteEvent,
  timestamp: '2022-11-08T20:21:33.931738Z',
  seqno: 4,
};

export const vaultCreatedEventFixture = {
  event: {
    kind: TimelineEventKind.vaultCreated,
    data: {
      actor: {
        kind: ActorKind.apiKey,
        id: 'api_key_1',
        name: 'Production key',
      },
    },
  } as VaultCreatedEvent,
  timestamp: '2022-11-08T20:21:33.931738Z',
  seqno: 4,
};

export const workflowTriggeredEventFixture = {
  event: {
    kind: TimelineEventKind.workflowTriggered,
    data: {
      requestIsActive: false,
      config: {
        kind: TriggerKind.Document,
        data: {
          configs: [
            {
              kind: DocumentRequestKind.Identity,
              data: {
                collectSelfie: true,
              },
            },
          ],
        },
      },
      actor: {
        kind: ActorKind.organization,
        member: 'Piip Penguin (piip@onefootprint.com)',
      },
      note: 'Hello today, please upload your flerpderp',
    },
  } as WorkflowTriggeredEvent,
  timestamp: '2022-11-08T20:21:33.931738Z',
  seqno: 4,
};

export const workflowStartedEventFixture = {
  event: {
    kind: TimelineEventKind.workflowStarted,
    data: {
      playbook: {
        id: 'ob_config_id_3o5SdynZVGO1icDm8Z6llC',
        name: 'My Playbook',
        playbookId: 'pb_cnHbDNQ2AENjW4bC5wBY3v',
        mustCollectData: [],
      },
      kind: WorkflowStartedEventKind.playbook,
      workflowSource: 'hosted',
    },
  } as WorkflowStartedEvent,
  timestamp: '2022-11-08T20:21:33.931738Z',
  seqno: 4,
};

export const authMethodUpdatedEventFixture = {
  event: {
    kind: TimelineEventKind.authMethodUpdated,
    data: {
      kind: AuthMethodKind.phone,
      action: AuthMethodAction.add_primary,
      insightEvent: {
        timestamp: '2022-11-08T20:21:49.971354Z',
        ipAddress: '104.28.39.72',
        city: 'Nashua',
        country: 'United States',
        region: 'NH',
        regionName: 'New Hampshire',
        latitude: 42.7628,
        longitude: -71.4674,
        metroCode: '506',
        postalCode: '03061',
        timeZone: 'America/New_York',
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      },
    },
  } as AuthMethodUpdatedEvent,
  timestamp: '2022-11-08T20:21:33.931738Z',
  seqno: 4,
};

export const externalIntegrationCalledEventFixture = {
  event: {
    kind: TimelineEventKind.externalIntegrationCalled,
    data: {
      integration: ExternalIntegrationKind.alpacaCip,
      successful: true,
    },
  } as ExternalIntegrationCalledEvent,
  timestamp: '2022-11-08T20:21:33.931738Z',
  seqno: 4,
};

export const stepUpEventFixture = {
  event: {
    kind: TimelineEventKind.stepUp,
    data: [
      {
        kind: StepUpDocumentKind.identity,
        ruleSetResultId: 'rule_set_result_1',
      },
    ],
  } as StepUpEvent,
  timestamp: '2022-11-08T20:21:33.931738Z',
  seqno: 4,
};
