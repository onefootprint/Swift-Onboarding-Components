import {
  IdDocDataAttribute,
  InsightEvent,
  OnboardingStatus,
  PinnedAnnotation,
  RiskSignal,
  RiskSignalSeverity,
  ScopedUser,
  TimelineEvent,
  UserDataAttribute,
} from '@onefootprint/types';

// Encapsulates all user data
export type User = {
  metadata: UserMetadata;
  vaultData: UserVaultData;
  timeline: UserTimeline;
  annotations: UserAnnotations;
  riskSignals: UserRiskSignals;
  liveness: UserLiveness;
};

export type UserLiveness = {
  insightEvent?: InsightEvent;
};

export type UserAnnotations = {
  annotations: PinnedAnnotation[];
};

type RiskSignalSeverityGrouping = {
  [RiskSignalSeverity.Low]: RiskSignal[];
  [RiskSignalSeverity.Medium]: RiskSignal[];
  [RiskSignalSeverity.High]: RiskSignal[];
};

export type UserRiskSignals = {
  basic: RiskSignalSeverityGrouping;
  identity: RiskSignalSeverityGrouping;
  address: RiskSignalSeverityGrouping;
};

export type UserTimeline = {
  events: TimelineEvent[];
};

export type UserMetadata = ScopedUser & {
  // Derived fields
  requiresManualReview: boolean;
  status: OnboardingStatus;
};

export type UserVaultData = {
  kycData: Partial<Record<UserDataAttribute, DataValue>>;
  idDoc: Partial<Record<IdDocDataAttribute, DataValue>>;
};

export type DataValue = string | null; // Null value means encrypted
