// TEMP file

export type PartnerCompany = {
  id: string;
  name: string;
  controls: {
    total: number;
    value: number;
  };
  activePlaybooks: number;
};

export enum PartnerDocumentStatus {
  NotUploaded = 'not_uploaded',
  Accepted = 'accepted',
  Rejected = 'rejected',
  WaitingForReview = 'waiting_for_review',
}

export type SecurityChecks = {
  accessControl: boolean;
  dataAccess: boolean;
  strongAuthentication: boolean;
  dataEndToEndEncryption: boolean;
};

export type PartnerDocument = {
  id: string;
  name: string;
  status: PartnerDocumentStatus | null;
  assignedTo: {
    id: string;
    name: string;
  } | null;
  lastUpdated: string | null;
};

export type PartnerDocumentTemplate = {
  id: string;
  name: string;
  format: string;
  frequency: string;
  lastUpdated: string | null;
};
