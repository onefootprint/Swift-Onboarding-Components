import { CollectedKycDataOption } from './collected-kyc-data-option';
import IdScanDocType from './id-scan-doc-type';
import { InsightEvent } from './insight-event';
import { OnboardingDecision } from './onboarding-decision';

export enum TimelineEventKind {
  kycDataCollected = 'data_collected',
  onboardingDecision = 'onboarding_decision',
  biometricRegistered = 'biometric_registered',
  idDocUploaded = 'document_uploaded',
}

export type CollectedKycDataEvent = {
  attributes: CollectedKycDataOption[];
};

export type BiometricRegisteredEvent = {
  insightEvent: InsightEvent;
  kind: BiometricRegistrationKind;
  webauthnCredential?: WebauthnCredential;
};

export type IdDocUploadedEvent = {
  idDocKind: IdScanDocType;
};

export type OnboardingDecisionEvent = OnboardingDecision;

export type TimelineEvent = {
  event: {
    kind: TimelineEventKind;
    data:
      | CollectedKycDataEvent
      | BiometricRegisteredEvent
      | IdDocUploadedEvent
      | OnboardingDecisionEvent;
  };
  timestamp: string;
};

export type Timeline = TimelineEvent[];

export enum BiometricRegistrationKind {
  webauthn = 'webauthn',
  privacyPass = 'privacy_pass',
}

export type WebauthnCredential = {
  attestations: string[];
  location: string;
  os: string;
  device: string;
};
