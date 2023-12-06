import type { TriggerKind } from '../api/trigger';
import type { Actor } from './actor';
import type { Annotation } from './annotation';
import type {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from './collected-data-option';
import type { IdDocStatus, SupportedIdDocTypes } from './id-doc-type';
import type { InsightEvent } from './insight-event';
import type { LivenessAttribute, LivenessSource } from './liveness';
import type {
  OnboardingDecision,
  TimelinePlaybook,
} from './onboarding-decision';

export enum TimelineEventKind {
  dataCollected = 'data_collected',
  onboardingDecision = 'onboarding_decision',
  liveness = 'liveness',
  idDocUploaded = 'identity_document_uploaded',
  watchlistCheck = 'watchlist_check',
  freeFormNote = 'annotation',
  combinedWatchlistChecks = 'combined_watchlist_checks',
  vaultCreated = 'vault_created',
  workflowTriggered = 'workflow_triggered',
  workflowStarted = 'workflow_started',
}

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

export type IdDocUploadedEvent = {
  kind: TimelineEventKind.idDocUploaded;
  data: IdDocUploadedEventData;
};

export type IdDocUploadedEventData = {
  selfieCollected: boolean;
  status: IdDocStatus;
  documentType: SupportedIdDocTypes;
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
  };
  actor: Actor;
};

export type WorkflowTriggeredEvent = {
  kind: TimelineEventKind.workflowTriggered;
  data: WorkflowTriggeredEventData;
};

export type WorkflowStartedEventData = {
  playbook: TimelinePlaybook;
};

export type WorkflowStartedEvent = {
  kind: TimelineEventKind.workflowStarted;
  data: WorkflowStartedEventData;
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

export type TimelineEvent = {
  event:
    | CollectedDataEvent
    | LivenessEvent
    | IdDocUploadedEvent
    | OnboardingDecisionEvent
    | WatchlistCheckEvent
    | FreeFormNoteEvent
    | CombinedWatchlistChecksEvent
    | VaultCreatedEvent
    | WorkflowTriggeredEvent
    | WorkflowStartedEvent;
  timestamp: string;
  isFromOtherOrg?: boolean;
};

export type Timeline = TimelineEvent[];
