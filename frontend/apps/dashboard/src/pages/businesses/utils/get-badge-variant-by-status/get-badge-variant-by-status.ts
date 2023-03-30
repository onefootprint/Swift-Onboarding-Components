import { UIState } from '@onefootprint/design-tokens';
import { EntityStatus } from '@onefootprint/types';

const statusToVariant: Record<EntityStatus, UIState> = {
  [EntityStatus.pass]: 'success',
  [EntityStatus.failed]: 'error',
  [EntityStatus.incomplete]: 'warning',
  [EntityStatus.pending]: 'warning',
};

const getBadgeVariantByStatus = (
  status: EntityStatus,
  requiresManualReview?: boolean,
): UIState => {
  if (status === EntityStatus.pass && requiresManualReview) {
    return 'warning';
  }
  return statusToVariant[status];
};

export default getBadgeVariantByStatus;
