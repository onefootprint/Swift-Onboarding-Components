import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  DASHBOARD_AUTHORIZATION_HEADER,
  DASHBOARD_IS_LIVE_HEADER,
} from '../../config/constants';
import {
  AuthHeaders,
  MetaSession,
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
      version: 7,
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

  const logIn = (session: {
    auth: string;
    user: UserSession;
    meta: MetaSession;
    org: Omit<OrgSession, 'isLive'>;
  }) => {
    update({
      auth: session.auth,
      user: session.user,
      meta: session.meta,
      org: {
        ...session.org,
        isLive: !session.org.isSandboxRestricted,
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

  const completeOnboarding = () => {
    if (!data) return;
    update({
      ...data,
      meta: { ...data.meta, requiresOnboarding: false },
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
    completeOnboarding,
  };
};

export default useSession;
