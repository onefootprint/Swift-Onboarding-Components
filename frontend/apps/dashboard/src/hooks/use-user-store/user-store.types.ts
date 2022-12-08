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

// Base type to remember whether to refresh / whether currently loading
export type UserFieldValue = {
  isLoading: boolean;
};

export type UserLiveness = UserFieldValue & {
  insightEvent?: InsightEvent;
};

export type UserAnnotations = UserFieldValue & {
  annotations: PinnedAnnotation[];
};

export type UserRiskSignals = UserFieldValue & {
  signals: RiskSignal[];
};

export type UserTimeline = UserFieldValue & {
  events: TimelineEvent[];
};

export type UserMetadata = UserFieldValue &
  ScopedUser & {
    // Derived fields
    requiresManualReview: boolean;
    status: OnboardingStatus;
  };

export type UserVaultData = UserFieldValue & {
  kycData: Partial<Record<UserDataAttribute, DataValue>>;
  idDoc: Partial<Record<IdDocDataAttribute, DataValue>>;
};

export type DataValue = string | null; // Null value means encrypted
