import { CollectedKycDataOption } from './collected-kyc-data-option';
import ComplianceStatus from './compliance-status';
import Vendor from './vendor';
import VerificationStatus from './verification-status';

export enum DecisionSourceKind {
  footprint = 'footprint',
  organization = 'organization',
}

export type DecisionSourceFootprint = {
  kind: DecisionSourceKind.footprint;
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
  obConfiguration: {
    mustCollectData: CollectedKycDataOption[];
    mustCollectIdentityDocument: boolean;
    // TODO: replace with the following
    // TODO: https://linear.app/footprint/issue/FP-1837/use-collected-id-document-types-in-audit-trail-right-now-we-default-to
    // collectedIdDocuments: IdScanDocType[];
  };
  vendors: Vendor[];
};
