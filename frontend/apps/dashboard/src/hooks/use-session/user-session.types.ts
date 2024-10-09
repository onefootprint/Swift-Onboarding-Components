import type { Organization, RoleScope } from '@onefootprint/types';

import type {
  DASHBOARD_ALLOW_ASSUMED_WRITES,
  DASHBOARD_AUTHORIZATION_HEADER,
  DASHBOARD_IS_LIVE_HEADER,
} from '../../config/constants';

export type UserSession = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  scopes: RoleScope[];
  isAssumedSession: boolean;
  isAssumedSessionEditMode?: boolean;
  isFirmEmployee?: boolean;
};

export type OrgSession = {
  isLive: boolean;
} & Pick<
  Organization,
  | 'isProdKybPlaybookRestricted'
  | 'isProdKycPlaybookRestricted'
  | 'isProdAuthPlaybookRestricted'
  | 'isProdNeuroEnabled'
  | 'isProdSentilinkEnabled'
  | 'isSandboxRestricted'
  | 'logoUrl'
  | 'id'
  | 'name'
>;

export type MetaSession = {
  createdNewTenant: boolean;
  isFirstLogin: boolean;
  requiresOnboarding: boolean;
};

export type Session = {
  auth?: string;
  user?: UserSession;
  org?: OrgSession;
  meta: MetaSession;
};

export const defaultSession = {
  auth: undefined,
  user: undefined,
  org: undefined,
  meta: {
    createdNewTenant: false,
    isFirstLogin: false,
    requiresOnboarding: false,
  },
};

// Whenever changing this, make sure to read this guide:
// https://www.notion.so/onefootprint/Migrating-session-w-Zustand-92cc5a563d6747ca80fd689232c5b7b4
export type UserSessionState = {
  data: Session;
  update: (data: Partial<Session>) => void;
  reset: () => void;
};

export type AuthHeaders = {
  [DASHBOARD_AUTHORIZATION_HEADER]: string;
  [DASHBOARD_IS_LIVE_HEADER]: string;
  [DASHBOARD_ALLOW_ASSUMED_WRITES]?: string;
};
