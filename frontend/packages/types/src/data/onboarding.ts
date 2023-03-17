import { CollectedDataOption } from './collected-data-option';
import { InsightEvent } from './insight-event';
import { OnboardingDecision } from './onboarding-decision';
import OnboardingStatus from './onboarding-status';
import UserDataAttribute from './user-data-attribute';

export type Onboarding = {
  id: string;
  isAuthorized: boolean;
  name: string;
  configId: string;
  requiresManualReview: boolean;
  status: OnboardingStatus;
  timestamp: string;
  isLivenessSkipped: boolean;
  insightEvent: InsightEvent;
  canAccessData: CollectedDataOption[];
  // TODO: Deprecate canAccessDataAttributes and canAccessIdentityDocumentImages
  // https://linear.app/footprint/issue/FP-3146/deprecate-canaccessdataattributes
  canAccessDataAttributes: UserDataAttribute[];
  canAccessIdentityDocumentImages: boolean;
  latestDecision?: OnboardingDecision;
};
