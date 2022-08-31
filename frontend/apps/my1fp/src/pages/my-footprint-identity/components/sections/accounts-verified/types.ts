import { InsightEvent, UserDataAttribute } from 'types';

export type AuthorizedOrgOnboarding = {
  canAccessData: UserDataAttribute[];
  insightEvent: InsightEvent;
  name: string;
  status: string;
  timestamp: string;
};

export type AuthorizedOrg = {
  id: string;
  logoUrl: string;
  name: string;
  onboardings: AuthorizedOrgOnboarding[];
  tenantId: string;
};
