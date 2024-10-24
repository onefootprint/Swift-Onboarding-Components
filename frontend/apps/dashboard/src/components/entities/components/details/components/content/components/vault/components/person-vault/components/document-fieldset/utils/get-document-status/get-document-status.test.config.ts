import type { Document } from '@onefootprint/types';
import { DocumentReviewStatus, IdDocStatus } from '@onefootprint/types';

export const documents = [
  {
    status: IdDocStatus.failed,
    reviewStatus: DocumentReviewStatus.Unreviewed,
  },
  {
    status: IdDocStatus.pending,
    reviewStatus: DocumentReviewStatus.Unreviewed,
  },
  {
    status: IdDocStatus.complete,
    reviewStatus: DocumentReviewStatus.PendingHumanReview,
  },
  {
    status: IdDocStatus.complete,
    reviewStatus: DocumentReviewStatus.ReviewedByHuman,
  },
  {
    status: IdDocStatus.complete,
    reviewStatus: DocumentReviewStatus.PendingMachineReview,
  },
  {
    status: IdDocStatus.complete,
    reviewStatus: DocumentReviewStatus.ReviewedByMachine,
  },
  {
    status: null,
    reviewStatus: null,
  },
] as Document[];
