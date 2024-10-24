import type { Document } from '@onefootprint/types';
import { DocumentReviewStatus, IdDocStatus } from '@onefootprint/types';

/** A composite representation of the document's upload status AND review status */
export enum DocumentStatus {
  UploadFailed = 'upload_failed',
  UploadIncomplete = 'upload_incomplete',
  UploadedViaApi = 'uploaded_via_api',
  PendingMachineReview = 'pending_machine_review',
  ReviewedByMachine = 'reviewed_by_machine',
  PendingHumanReview = 'pending_human_review',
  ReviewedByHuman = 'reviewed_by_human',
}

export const getDocumentStatus = (document: Omit<Document, 'uploads'>) => {
  if (!document.status) {
    return DocumentStatus.UploadedViaApi;
  }
  if (document.status === IdDocStatus.failed) {
    return DocumentStatus.UploadFailed;
  }
  if (document.status === IdDocStatus.pending) {
    return DocumentStatus.UploadIncomplete;
  }

  // If the upload is complete, show a status badge that depends on the review status
  if (!document.reviewStatus) {
    return DocumentStatus.UploadIncomplete;
  }
  const reviewStatusToDocumentStatus: Record<DocumentReviewStatus, DocumentStatus | null> = {
    [DocumentReviewStatus.NotNeeded]: null,
    [DocumentReviewStatus.Unreviewed]: DocumentStatus.UploadIncomplete,
    [DocumentReviewStatus.PendingHumanReview]: DocumentStatus.PendingHumanReview,
    [DocumentReviewStatus.PendingMachineReview]: DocumentStatus.PendingMachineReview,
    [DocumentReviewStatus.ReviewedByMachine]: DocumentStatus.ReviewedByMachine,
    [DocumentReviewStatus.ReviewedByHuman]: DocumentStatus.ReviewedByHuman,
  };
  return reviewStatusToDocumentStatus[document.reviewStatus];
};

export default getDocumentStatus;
