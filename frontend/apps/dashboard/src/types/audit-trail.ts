import { DataKinds } from './data-kind';
import { Vendor } from './vendor';

export type LivenessCheckInfo = {
  attestations: string[];
  device: string;
  os?: string;
  ipAddress?: string;
  location?: string;
};

export type VerificationInfo = {
  dataAttributes: DataKinds[];
  vendor: Vendor;
};

export type AuditTrailEvent = {
  kind: 'liveness_check' | 'verification';
  data: LivenessCheckInfo | VerificationInfo;
};

export type AuditTrail = {
  event: AuditTrailEvent;
  timestamp: string;
};
