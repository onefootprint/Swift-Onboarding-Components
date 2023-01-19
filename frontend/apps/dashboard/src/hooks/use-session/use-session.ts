import { Organization, OrgMember } from '@onefootprint/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  DASHBOARD_AUTHORIZATION_HEADER,
  DASHBOARD_IS_LIVE_HEADER,
} from '../../config/constants';

export type UserSession = {
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

export type Session = {
  auth: string;
  user: UserSession;
  org: OrgSession;
};

export type AuthHeaders = {
  [DASHBOARD_AUTHORIZATION_HEADER]: string;
  [DASHBOARD_IS_LIVE_HEADER]: string;
};

// Whenever changing this, make sure to read this guide:
// https://www.notion.so/onefootprint/Migrating-session-w-Zustand-92cc5a563d6747ca80fd689232c5b7b4
type UserSessionState = {
  data?: Session;
  update: (data?: Session) => void;
  reset: () => void;
};

export const useStore = create<UserSessionState>()(
  persist(
    set => ({
      data: undefined,
      reset: () => set({ data: undefined }),
      update: (data?: Session) => set({ data }),
    }),
    {
      version: 3,
      name: 'dashboard-storage',
    },
  ),
);

const useSession = () => {
  const { data, reset, update } = useStore(state => state);
  const dangerouslyCastedData = data as Session;
  const isLoggedIn = !!data;
  const isLive = !!data?.org?.isLive;

  const authHeaders = {
    [DASHBOARD_AUTHORIZATION_HEADER]: data?.auth as string,
    [DASHBOARD_IS_LIVE_HEADER]: JSON.stringify(isLive),
  } as AuthHeaders;

  const logIn = (
    authToken: string,
    user: OrgMember,
    organization: Organization,
  ) => {
    update({
      auth: authToken,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      org: {
        name: organization.name,
        logoUrl: organization.logoUrl,
        isSandboxRestricted: organization.isSandboxRestricted,
        isLive: !organization.isSandboxRestricted,
      },
    });
  };

  const logOut = () => {
    reset();
  };

  const setOrg = (nextOrg: Partial<OrgSession>) => {
    if (!data) return;
    update({
      ...data,
      org: { ...data.org, ...nextOrg },
    });
  };

  const setUser = (nextUser: Partial<UserSession>) => {
    if (!data) return;
    update({
      ...data,
      user: { ...data.user, ...nextUser },
    });
  };

  return {
    authHeaders,
    dangerouslyCastedData,
    data,
    isLoggedIn,
    logIn,
    logOut,
    setOrg,
    setUser,
  };
};

export default useSession;
