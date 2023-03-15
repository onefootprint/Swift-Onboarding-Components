import { UIState } from '@onefootprint/design-tokens';
import { UserStatus } from '@onefootprint/types';

const statusToVariant: Record<UserStatus, UIState> = {
  [UserStatus.verified]: 'success',
  [UserStatus.failed]: 'error',
  [UserStatus.vaultOnly]: 'neutral',
  [UserStatus.incomplete]: 'warning',
  [UserStatus.pending]: 'warning',
};

const getUserStatusBadgeVariant = (
  status: UserStatus,
  requiresManualReview?: boolean,
): UIState => {
  if (status === UserStatus.verified && requiresManualReview) {
    return 'warning';
  }
  return statusToVariant[status];
};

export default getUserStatusBadgeVariant;
