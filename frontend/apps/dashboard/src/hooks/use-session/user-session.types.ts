import { Organization } from '@onefootprint/types';

import {
  DASHBOARD_AUTHORIZATION_HEADER,
  DASHBOARD_IS_LIVE_HEADER,
} from '../../config/constants';

export type UserSession = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export type OrgSession = {
  name: Organization['name'];
  logoUrl: Organization['logoUrl'];
  isSandboxRestricted: Organization['isSandboxRestricted'];
  isLive: boolean;
};

export type MetaSession = {
  createdNewTenant: boolean;
  isFirstLogin: boolean;
  requiresOnboarding: boolean;
};

export type Session = {
  auth: string;
  user: UserSession;
  org: OrgSession;
  meta: MetaSession;
};

// Whenever changing this, make sure to read this guide:
// https://www.notion.so/onefootprint/Migrating-session-w-Zustand-92cc5a563d6747ca80fd689232c5b7b4
export type UserSessionState = {
  data?: Session;
  update: (data?: Session) => void;
  reset: () => void;
};

export type AuthHeaders = {
  [DASHBOARD_AUTHORIZATION_HEADER]: string;
  [DASHBOARD_IS_LIVE_HEADER]: string;
};
