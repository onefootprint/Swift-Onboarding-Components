import { RequestError } from '@onefootprint/request';
import {
  DecryptedIdDoc,
  IdDocType,
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
};

export type UserErrors = {
  metadata: RequestError | unknown | null;
  timeline: RequestError | unknown | null;
  annotations: RequestError | unknown | null;
  riskSignals: RequestError | unknown | null;
  liveness: RequestError | unknown | null;
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
  kycData: Partial<Record<UserDataAttribute, KycDataValue>>;
  idDoc: Partial<Record<IdDocType, IdDocDataValue>>;
};

export type KycDataValue = string | null; // Null value means encrypted
export type IdDocDataValue = DecryptedIdDoc[] | null;
