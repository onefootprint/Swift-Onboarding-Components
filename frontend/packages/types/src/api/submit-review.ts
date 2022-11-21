import { ReviewStatus } from '../data';

export type SubmitReviewRequest = {
  footprintUserId: string;
  annotation: {
    isPinned: boolean;
    note: string;
  };
  status: ReviewStatus;
};

export type SubmitReviewResponse = {};
