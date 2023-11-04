import type { ReviewStatus } from '../data';

export type SubmitReviewRequest = {
  entityId: string;
  annotation: {
    isPinned: boolean;
    note: string;
  };
  status: ReviewStatus;
};

export type SubmitReviewResponse = {};
