import { UIState } from '@onefootprint/design-tokens';
import { OnboardingStatus } from '@onefootprint/types';

export const statusToPriority = {
  [OnboardingStatus.failed]: 2,
  [OnboardingStatus.verified]: 3,
  [OnboardingStatus.vaultOnly]: 4,
};

export const statusToBadgeVariant: Record<OnboardingStatus, UIState> = {
  [OnboardingStatus.verified]: 'success',
  [OnboardingStatus.failed]: 'error',
  [OnboardingStatus.vaultOnly]: 'neutral',
};

export const statusToDisplayText: Record<OnboardingStatus, string> = {
  [OnboardingStatus.verified]: 'Verified',
  [OnboardingStatus.failed]: 'Failed',
  [OnboardingStatus.vaultOnly]: 'Vault',
};
