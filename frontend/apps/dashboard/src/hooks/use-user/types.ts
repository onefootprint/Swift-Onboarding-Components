import { RequestError } from '@onefootprint/request';
import {
  IdDocDataAttribute,
  Liveness,
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
  metadata?: UserMetadata;
  vaultData?: UserVaultData;
  timeline?: UserTimeline;
  annotations?: UserAnnotations;
  riskSignals?: UserRiskSignals;
  liveness?: UserLiveness;
};

export type UserLoadingStates = {
  metadata: boolean;
  timeline: boolean;
  annotations: boolean;
  riskSignals: boolean;
  liveness: boolean;
  vaultData: boolean;
};

export type UserErrors = {
  metadata: RequestError | null;
  timeline: RequestError | null;
  annotations: RequestError | null;
  riskSignals: RequestError | null;
  liveness: RequestError | null;
  vaultData: RequestError | null;
};

export type UserLiveness = {
  events: Liveness[];
};

export type UserAnnotations = {
  entries: PinnedAnnotation[];
};

export type RiskSignalSeverityGrouping = {
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
