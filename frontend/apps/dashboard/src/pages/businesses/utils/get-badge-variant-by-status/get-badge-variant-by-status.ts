import { UIState } from '@onefootprint/design-tokens';
import { BusinessStatus } from '@onefootprint/types';

const statusToVariant: Record<BusinessStatus, UIState> = {
  [BusinessStatus.verified]: 'success',
  [BusinessStatus.failed]: 'error',
  [BusinessStatus.incomplete]: 'warning',
};

const getBadgeVariantByStatus = (
  status: BusinessStatus,
  requiresManualReview?: boolean,
): UIState => {
  if (status === BusinessStatus.verified && requiresManualReview) {
    return 'warning';
  }
  return statusToVariant[status];
};

export default getBadgeVariantByStatus;
