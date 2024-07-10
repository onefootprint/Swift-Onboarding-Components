import type { DataIdentifier } from './di';
import type { IdDocImageTypes, IdDocStatus, SupportedIdDocTypes } from './id-doc-type';

export type DocumentUpload = {
  version: number;
  failureReasons: string[];
  side: IdDocImageTypes;
  timestamp: string;
  isExtraCompressed: boolean;
  identifier: DataIdentifier;
};

export enum UploadSource {
  Mobile = 'mobile',
  Desktop = 'desktop',
  Api = 'api',
}

export enum DocumentReviewStatus {
  NotNeeded = 'not_needed',
  Unreviewed = 'unreviewed',
  PendingMachineReview = 'pending_machine_review',
  ReviewedByMachine = 'reviewed_by_machine',
  PendingHumanReview = 'pending_human_review',
  ReviewedByHuman = 'reviewed_by_human',
}

export type Document = {
  completedVersion: number | null;
  kind: SupportedIdDocTypes;
  startedAt?: string;
  /** The status of uploading the document. Null if uploaded manually via vault APIs */
  status?: IdDocStatus;
  /** The status of whether the document has been reviewed. Null if uploaded manually via vault APIs */
  reviewStatus?: DocumentReviewStatus;
  uploads: DocumentUpload[];
  documentScore: number | null;
  selfieScore: number | null;
  ocrConfidenceScore: number | null;
  uploadSource: UploadSource;
  curpCompletedVersion?: string | null;
};

export enum RawJsonKinds {
  CurpValidationResponse = 'curp_validation_response',
}
