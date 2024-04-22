import type { TriggerKind } from '../api/trigger';
import type { Actor } from './actor';
import type { Annotation } from './annotation';
import type AuthMethodKind from './auth-method';
import type {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from './collected-data-option';
import type { DocumentRequestConfig } from './document-request-config';
import type { EntityLabel } from './entity';
import type { IdDocStatus, SupportedIdDocTypes } from './id-doc-type';
import type { InsightEvent } from './insight-event';
import type { LivenessAttribute, LivenessSource } from './liveness';
import type {
  OnboardingDecision,
  TimelinePlaybook,
} from './onboarding-decision';

export enum TimelineEventKind {
  labelAdded = 'label_added',
  dataCollected = 'data_collected',
  onboardingDecision = 'onboarding_decision',
  liveness = 'liveness',
  documentUploaded = 'document_uploaded',
  watchlistCheck = 'watchlist_check',
  freeFormNote = 'annotation',
  combinedWatchlistChecks = 'combined_watchlist_checks',
  vaultCreated = 'vault_created',
  workflowTriggered = 'workflow_triggered',
  workflowStarted = 'workflow_started',
  authMethodUpdated = 'auth_method_updated',
  externalIntegrationCalled = 'external_integration_called',
  stepUp = 'step_up',
}

export type LabelAddedEvent = {
  kind: TimelineEventKind.labelAdded;
  data: LabelAddedEventData;
};

export type LabelAddedEventData = {
  kind: EntityLabel;
};

export type CollectedDataEvent = {
  kind: TimelineEventKind.dataCollected;
  data: CollectedDataEventData;
};

export type CollectedDataEventData = {
  isPrefill: boolean;
  attributes: (
    | CollectedKybDataOption
    | CollectedKycDataOption
    | CollectedInvestorProfileDataOption
  )[];
  actor?: Actor;
};

export type FreeFormNoteEvent = {
  kind: TimelineEventKind.freeFormNote;
  data: Annotation;
};

export type LivenessEvent = {
  kind: TimelineEventKind.liveness;
  data: LivenessEventData;
};

export type LivenessEventData = {
  insightEvent: InsightEvent;
  source: LivenessSource;
  attributes?: LivenessAttribute;
};

export type DocumentUploadedEvent = {
  kind: TimelineEventKind.documentUploaded;
  data: DocumentUploadedEventData;
};

export type DocumentUploadedEventData = {
  status: IdDocStatus;
  documentType: SupportedIdDocTypes;
  config: DocumentRequestConfig;
};

export type OnboardingDecisionEvent = {
  kind: TimelineEventKind.onboardingDecision;
  data: OnboardingDecisionEventData;
};

export type OnboardingDecisionEventData = {
  decision: OnboardingDecision;
  annotation: Annotation | null;
};

export type WatchlistCheckEvent = {
  kind: TimelineEventKind.watchlistCheck;
  data: WatchlistCheckEventData;
};

export type VaultCreatedEventData = {
  actor: Actor;
};

export type VaultCreatedEvent = {
  kind: TimelineEventKind.vaultCreated;
  data: VaultCreatedEventData;
};

export type WorkflowTriggeredEventData = {
  workflow: {
    kind: TriggerKind;
  };
  request?: {
    id: string;
    isDeactivated: boolean;
    playbookId: string;
  };
  actor: Actor;
  note?: string;
};

export type WorkflowTriggeredEvent = {
  kind: TimelineEventKind.workflowTriggered;
  data: WorkflowTriggeredEventData;
};

export enum WorkflowStartedEventKind {
  playbook = 'playbook',
  document = 'document',
}

export type WorkflowStartedEventData = {
  kind: WorkflowStartedEventKind;
  playbook: TimelinePlaybook;
};

export type WorkflowStartedEvent = {
  kind: TimelineEventKind.workflowStarted;
  data: WorkflowStartedEventData;
};

export type AuthMethodUpdatedData = {
  kind: AuthMethodKind;
  action: AuthMethodAction;
  insightEvent: InsightEvent;
};

export type AuthMethodUpdatedEvent = {
  kind: TimelineEventKind.authMethodUpdated;
  data: AuthMethodUpdatedData;
};

export enum AuthMethodAction {
  add_primary = 'add_primary',
  replace = 'replace',
}

export enum ExternalIntegrationKind {
  alpacaCip = 'alpaca_cip',
}
export type ExternalIntegrationCalledData = {
  integration: ExternalIntegrationKind;
  successful: boolean;
  externalId?: string;
};

export type ExternalIntegrationCalledEvent = {
  kind: TimelineEventKind.externalIntegrationCalled;
  data: ExternalIntegrationCalledData;
};

export enum WatchlistCheckReasonCode {
  watchlistHitOfac = 'watchlist_hit_ofac',
  watchlistHitPep = 'watchlist_hit_pep',
}

export enum WatchlistCheckStatus {
  error = 'error',
  notNeeded = 'not_needed',
  pass = 'pass',
  fail = 'fail',
}

export type WatchlistCheckEventData = {
  id: string;
  reasonCodes: WatchlistCheckReasonCode[];
  status: WatchlistCheckStatus;
};

export type CombinedWatchlistChecksEvent = {
  kind: TimelineEventKind.combinedWatchlistChecks;
  data: PreviousWatchlistChecksEventData;
  latestWatchlistEvent: WatchlistCheckEvent | null;
};

export type PreviousWatchlistChecksEventData = {
  watchlistEvent: WatchlistCheckEvent;
  timestamp: string;
}[];

export type StepUpEvent = {
  kind: TimelineEventKind.stepUp;
  data: StepUpEventData;
};

export type StepUpEventData = StepUpDocument[];

export type StepUpDocument = {
  kind: StepUpDocumentKind;
  ruleSetResultId: string;
};

export enum StepUpDocumentKind {
  identity = 'identity',
  proofOfSsn = 'proof_of_ssn',
  proofOfAddress = 'proof_of_address',
}

export type TimelineEvent = {
  event:
    | LabelAddedEvent
    | CollectedDataEvent
    | LivenessEvent
    | DocumentUploadedEvent
    | OnboardingDecisionEvent
    | WatchlistCheckEvent
    | FreeFormNoteEvent
    | CombinedWatchlistChecksEvent
    | VaultCreatedEvent
    | WorkflowTriggeredEvent
    | WorkflowStartedEvent
    | AuthMethodUpdatedEvent
    | ExternalIntegrationCalledEvent
    | StepUpEvent;
  timestamp: string;
};

export type Timeline = TimelineEvent[];
