import { UIState } from '@onefootprint/design-tokens';
import { OnboardingStatus } from '@onefootprint/types';

const statusToVariant: Record<OnboardingStatus, UIState> = {
  [OnboardingStatus.verified]: 'success',
  [OnboardingStatus.failed]: 'error',
  [OnboardingStatus.vaultOnly]: 'neutral',
};

const getOnboardingStatusBadgeVariant = (
  status: OnboardingStatus,
  requiresManualReview?: boolean,
): UIState => {
  if (status === OnboardingStatus.verified && requiresManualReview) {
    return 'warning';
  }
  return statusToVariant[status];
};

export default getOnboardingStatusBadgeVariant;
