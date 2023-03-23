import { Annotation } from './annotation';
import { CollectedKycDataOption } from './collected-data-option';
import { DecryptedIdDocStatus } from './decrypted-id-doc';
import IdDocType from './id-doc-type';
import { InsightEvent } from './insight-event';
import { LivenessAttribute, LivenessSource } from './liveness';
import { OnboardingDecision } from './onboarding-decision';

export enum TimelineEventKind {
  kycDataCollected = 'data_collected',
  onboardingDecision = 'onboarding_decision',
  liveness = 'liveness',
  idDocUploaded = 'identity_document_uploaded',
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
  annotation?: Annotation;
};

export type TimelineEvent = {
  event:
    | CollectedKycDataEvent
    | LivenessEvent
    | IdDocUploadedEvent
    | OnboardingDecisionEvent;
  timestamp: string;
  isFromOtherOrg?: boolean;
};

export type Timeline = TimelineEvent[];
