import type { Document, SupportedIdDocTypes } from '@onefootprint/types';
import { IdDocStatus } from '@onefootprint/types';
import { DocumentReviewStatus } from '@onefootprint/types/src/data/document-type';

import filterDocumentsByKind from '../filter-documents-by-kind';

type GetDocumentStatusProps = {
  documents?: Document[];
  documentType?: SupportedIdDocTypes;
};

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

/**
 * Given the list of documents of one type, determines what we should show in the status badge.
 */
const getDocumentStatus = ({ documents, documentType }: GetDocumentStatusProps) => {
  const relevantDocuments = filterDocumentsByKind(documents, documentType);
  const mostRecentDocument = relevantDocuments.sort((a, b) => {
    if (!a.startedAt || !b.startedAt) return 0;
    return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
  })[0];

  if (!mostRecentDocument) {
    return null;
  }
  return computeSingleDocumentStatus(mostRecentDocument);
};

export const computeSingleDocumentStatus = (document: Document) => {
  if (!document.status) {
    return DocumentStatus.UploadedViaApi;
  }
  if (document.status === IdDocStatus.failed) {
    return DocumentStatus.UploadFailed;
  }
  if (document.status === IdDocStatus.pending) {
    return DocumentStatus.UploadIncomplete;
  }

  // Then, if the upload is complete, show a status badge that depends on the review status
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
