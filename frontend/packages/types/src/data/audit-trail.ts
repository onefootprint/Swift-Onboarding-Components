import { LivenessCheckInfo } from './liveness-check-info';
import { VerificationInfo } from './verification-info';

export type AuditTrailEvent = {
  kind: 'liveness_check' | 'verification';
  data: LivenessCheckInfo | VerificationInfo;
};

export type AuditTrail = {
  event: AuditTrailEvent;
  timestamp: string;
};
