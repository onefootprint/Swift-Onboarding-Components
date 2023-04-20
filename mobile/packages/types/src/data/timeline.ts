import { Annotation } from './annotation';
import {
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from './collected-data-option';
import { DecryptedIdDocStatus } from './decrypted-id-doc';
import IdDocType from './id-doc-type';
import { InsightEvent } from './insight-event';
import { LivenessAttribute, LivenessSource } from './liveness';
import { OnboardingDecision } from './onboarding-decision';

export enum TimelineEventKind {
  dataCollected = 'data_collected',
  onboardingDecision = 'onboarding_decision',
  liveness = 'liveness',
  idDocUploaded = 'identity_document_uploaded',
  watchlistCheck = 'watchlist_check',
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
  documentType: IdDocType;
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
  notNeeded = 'notNeeded',
  pass = 'pass',
  fail = 'fail',
}

export type WatchlistCheckEventData = {
  id: string;
  reasonCodes: WatchlistCheckReasonCode[];
  status: WatchlistCheckStatus;
};

export type TimelineEvent = {
  event:
    | CollectedDataEvent
    | LivenessEvent
    | IdDocUploadedEvent
    | OnboardingDecisionEvent
    | WatchlistCheckEvent;
  timestamp: string;
  isFromOtherOrg?: boolean;
};

export type Timeline = TimelineEvent[];
