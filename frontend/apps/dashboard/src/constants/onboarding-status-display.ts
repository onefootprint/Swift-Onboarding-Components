import { UIState } from '@onefootprint/themes';
import { OnboardingStatus } from '@onefootprint/types';

export const statusToPriority = {
  [OnboardingStatus.processing]: 1,
  [OnboardingStatus.manualReview]: 2,
  [OnboardingStatus.stepUpRequired]: 3,
  [OnboardingStatus.failed]: 4,
  [OnboardingStatus.verified]: 5,
  [OnboardingStatus.vaultOnly]: 6,
  [OnboardingStatus.new]: 7,
};

export const statusToBadgeVariant: Record<OnboardingStatus, UIState> = {
  [OnboardingStatus.verified]: 'success',
  [OnboardingStatus.new]: 'neutral',
  [OnboardingStatus.processing]: 'neutral',
  [OnboardingStatus.manualReview]: 'error',
  [OnboardingStatus.stepUpRequired]: 'error',
  [OnboardingStatus.failed]: 'error',
  [OnboardingStatus.vaultOnly]: 'neutral',
};

export const statusToDisplayText: Record<OnboardingStatus, string> = {
  [OnboardingStatus.verified]: 'Verified',
  [OnboardingStatus.new]: 'New',
  [OnboardingStatus.processing]: 'Processing',
  [OnboardingStatus.manualReview]: 'Manual review',
  [OnboardingStatus.stepUpRequired]: 'Step up',
  [OnboardingStatus.failed]: 'Failed',
  [OnboardingStatus.vaultOnly]: 'Vault',
};
