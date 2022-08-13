import { UIState } from 'themes';

export enum OnboardingStatus {
  verified = 'verified',
  manualReview = 'manual_review',
  processing = 'processing',
  failed = 'failed',
  vaultOnly = 'vault-only',
}

export const statusToPriority = {
  [OnboardingStatus.verified]: 4,
  [OnboardingStatus.processing]: 1,
  [OnboardingStatus.manualReview]: 2,
  [OnboardingStatus.failed]: 3,
  [OnboardingStatus.vaultOnly]: 5,
};

export const statusToBadgeVariant: Record<OnboardingStatus, UIState> = {
  [OnboardingStatus.verified]: 'success',
  [OnboardingStatus.processing]: 'neutral',
  [OnboardingStatus.manualReview]: 'error',
  [OnboardingStatus.failed]: 'error',
  [OnboardingStatus.vaultOnly]: 'neutral',
};

export const statusToDisplayText = {
  [OnboardingStatus.verified]: 'Verified',
  [OnboardingStatus.processing]: 'Processing',
  [OnboardingStatus.manualReview]: 'Manual review',
  [OnboardingStatus.failed]: 'Failed',
  [OnboardingStatus.vaultOnly]: 'Vault',
};
