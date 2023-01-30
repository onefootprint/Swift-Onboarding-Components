import { Organization, OrgMember } from '@onefootprint/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  DASHBOARD_AUTHORIZATION_HEADER,
  DASHBOARD_IS_LIVE_HEADER,
} from '../../config/constants';
import {
  AuthHeaders,
  OrgSession,
  Session,
  UserSession,
  UserSessionState,
} from './user-session.types';

export const useStore = create<UserSessionState>()(
  persist(
    set => ({
      data: undefined,
      reset: () => set({ data: undefined }),
      update: (data?: Session) => set({ data }),
    }),
    {
      version: 4,
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
        id: user.id,
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
