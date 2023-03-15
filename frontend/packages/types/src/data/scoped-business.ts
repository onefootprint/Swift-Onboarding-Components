import BusinessStatus from './business-status';
import { Onboarding } from './onboarding';

export type ScopedBusiness = {
  id: string;
  name: string;
  startTimestamp: string;
  onboarding?: Onboarding;
  orderingId: number;
};

export const getStatusForScopedBusiness = (scopedBusiness: ScopedBusiness) => {
  if (
    !scopedBusiness.onboarding?.isAuthorized &&
    scopedBusiness.onboarding?.status
  ) {
    return scopedBusiness.onboarding.status as unknown as BusinessStatus;
  }
  return BusinessStatus.incomplete;
};

export const getRequiresManualReviewForScopedBusiness = (
  scopedBusiness: ScopedBusiness,
) => {
  const status = getStatusForScopedBusiness(scopedBusiness);
  if (scopedBusiness.onboarding?.requiresManualReview) {
    return (
      scopedBusiness.onboarding?.requiresManualReview &&
      status !== BusinessStatus.incomplete
    );
  }
  return true;
};
