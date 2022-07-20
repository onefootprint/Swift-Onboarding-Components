import { UIState } from 'themes';

export enum OnboardingStatus {
  verified = 'verified',
  manualReview = 'manual_review',
  processing = 'processing',
  incomplete = 'incomplete',
  failed = 'failed',
}

export const statusToPriority = {
  [OnboardingStatus.verified]: 4,
  [OnboardingStatus.processing]: 1,
  [OnboardingStatus.manualReview]: 2,
  [OnboardingStatus.incomplete]: 0,
  [OnboardingStatus.failed]: 3,
};

export const statusToBadgeVariant: Record<OnboardingStatus, UIState> = {
  [OnboardingStatus.verified]: 'success',
  [OnboardingStatus.processing]: 'neutral',
  [OnboardingStatus.manualReview]: 'error',
  [OnboardingStatus.incomplete]: 'warning',
  [OnboardingStatus.failed]: 'error',
};

export const statusToDisplayText = {
  [OnboardingStatus.verified]: 'Verified',
  [OnboardingStatus.processing]: 'Processing',
  [OnboardingStatus.manualReview]: 'Manual review',
  [OnboardingStatus.incomplete]: 'Incomplete',
  [OnboardingStatus.failed]: 'Failed',
};
