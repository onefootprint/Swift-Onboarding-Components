import type { Annotation } from './annotation';
import type {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from './collected-data-option';
import type { DecryptedIdDocStatus } from './decrypted-id-doc';
import type { SupportedIdDocTypes } from './id-doc-type';
import type { InsightEvent } from './insight-event';
import type { LivenessAttribute, LivenessSource } from './liveness';
import type { OnboardingDecision } from './onboarding-decision';

export enum TimelineEventKind {
  dataCollected = 'data_collected',
  onboardingDecision = 'onboarding_decision',
  liveness = 'liveness',
  documentUploaded = 'identity_document_uploaded',
  watchlistCheck = 'watchlist_check',
  freeFormNote = 'annotation',
  combinedWatchlistChecks = 'combined_watchlist_checks',
}

export type CollectedDataEvent = {
  kind: TimelineEventKind.dataCollected;
  data: CollectedDataEventData;
};

export type CollectedDataEventData = {
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

export type DocumentUploadedEvent = {
  kind: TimelineEventKind.documentUploaded;
  data: DocumentUploadedEventData;
};

export type DocumentUploadedEventData = {
  documentType: SupportedIdDocTypes;
  id: string;
  selfieCollected: boolean;
  status: DecryptedIdDocStatus;
  timestamp: string;
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
    | DocumentUploadedEvent
    | OnboardingDecisionEvent
    | WatchlistCheckEvent
    | FreeFormNoteEvent
    | CombinedWatchlistChecksEvent;
  timestamp: string;
};

export type Timeline = TimelineEvent[];
