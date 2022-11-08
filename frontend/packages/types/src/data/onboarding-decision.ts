import { CollectedKycDataOption } from './collected-kyc-data-option';
import ComplianceStatus from './compliance-status';
import IdScanDocType from './id-scan-doc-type';
import Vendor from './vendor';
import VerificationStatus from './verification-status';

export enum DecisionSourceKind {
  footprint = 'footprint',
  organization = 'organization',
}

export type DecisionSourceFootprint = {
  kind: DecisionSourceKind.footprint;
  vendors: Vendor[];
};

export type DecisionSourceOrganization = {
  kind: DecisionSourceKind.organization;
  member: {
    email: string;
  };
  reason: string;
  note: string;
  notePinned: boolean;
};

export type DecisionSource =
  | DecisionSourceFootprint
  | DecisionSourceOrganization;

export type OnboardingDecision = {
  id: string;
  verificationStatus: VerificationStatus;
  complianceStatus: ComplianceStatus;
  timestamp: Date;
  source: DecisionSource;
  mustCollectData: CollectedKycDataOption[];
  collectedIdDocuments: IdScanDocType[];
};
