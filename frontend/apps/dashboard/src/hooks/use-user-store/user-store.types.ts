import {
  IdDocDataAttribute,
  InsightEvent,
  OnboardingStatus,
  PinnedAnnotation,
  RiskSignal,
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

export type UserRiskSignals = {
  signals: RiskSignal[];
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
