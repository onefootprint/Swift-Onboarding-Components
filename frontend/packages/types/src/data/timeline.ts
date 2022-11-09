import { CollectedKycDataOption } from './collected-kyc-data-option';
import IdDocType from './id-doc-type';
import { InsightEvent } from './insight-event';
import { LivenessAttribute, LivenessSource } from './liveness';
import { OnboardingDecision } from './onboarding-decision';

export enum TimelineEventKind {
  kycDataCollected = 'data_collected',
  onboardingDecision = 'onboarding_decision',
  liveness = 'liveness',
  idDocUploaded = 'document_uploaded',
}

export type CollectedKycDataEvent = {
  kind: TimelineEventKind.kycDataCollected;
  data: CollectedKycDataEventData;
};

export type CollectedKycDataEventData = {
  attributes: CollectedKycDataOption[];
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
  // TODO: https://linear.app/footprint/issue/FP-1837/use-collected-id-document-types-in-audit-trail-right-now-we-default-to
  idDocKind: IdDocType;
};

export type OnboardingDecisionEvent = {
  kind: TimelineEventKind.onboardingDecision;
  data: OnboardingDecisionEventData;
};

export type OnboardingDecisionEventData = OnboardingDecision;

export type TimelineEvent = {
  event:
    | CollectedKycDataEvent
    | LivenessEvent
    | IdDocUploadedEvent
    | OnboardingDecisionEvent;
  timestamp: string;
};

export type Timeline = TimelineEvent[];
