import { CollectedDataOption } from './collected-data-option';
import DecisionStatus from './decision-status';
import Vendor from './vendor';

export enum DecisionSourceKind {
  footprint = 'footprint',
  firmEmployee = 'firm_employee',
  organization = 'organization',
}

export type DecisionSourceFootprint = {
  kind: DecisionSourceKind.footprint;
};

export type DecisionSourceFirmEmployee = {
  kind: DecisionSourceKind.firmEmployee;
};

export type DecisionSourceOrganization = {
  kind: DecisionSourceKind.organization;
  member: string;
};

export type DecisionSource =
  | DecisionSourceFootprint
  | DecisionSourceOrganization
  | DecisionSourceFirmEmployee;

export type OnboardingDecision = {
  id: string;
  status: DecisionStatus;
  timestamp: Date;
  source: DecisionSource;
  obConfiguration: {
    mustCollectData: CollectedDataOption[];
    mustCollectIdentityDocument: boolean;
    // TODO: replace with the following
    // TODO: https://linear.app/footprint/issue/FP-1837/use-collected-id-document-types-in-audit-trail-right-now-we-default-to
    // collectedIdDocuments: IdDocType[];
  };
  vendors: Vendor[];
};
