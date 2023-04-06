import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  DASHBOARD_AUTHORIZATION_HEADER,
  DASHBOARD_IS_LIVE_HEADER,
} from '../../config/constants';
import {
  AuthHeaders,
  defaultSession,
  MetaSession,
  OrgSession,
  Session,
  UserSession,
  UserSessionState,
} from './user-session.types';

export const useStore = create<UserSessionState>()(
  persist(
    set => ({
      data: defaultSession,
      reset: () =>
        set({
          data: defaultSession,
        }),
      update: (data: Partial<Session>) => {
        set(oldSession => ({
          ...oldSession,
          data: {
            ...oldSession.data,
            ...data,
          },
        }));
      },
    }),
    {
      version: 8,
      name: 'dashboard-storage',
    },
  ),
);

const useSession = () => {
  const { data, reset, update } = useStore(state => state);
  // Dangerously cast fields that are nullable when the user is logged out into non-nullable fields
  // in order to remove unnecessary null checks in logged-in pages
  const dangerouslyCastedData = {
    auth: data.auth as string,
    user: data.user as UserSession,
    org: data.org as OrgSession,
    meta: data.meta,
  };
  const isLoggedIn = !!data.user;
  const isLive = !!data.org?.isLive;

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

  const setAssumedOrg = (nextOrg: Omit<OrgSession, 'isLive'>) => {
    update({
      org: {
        ...nextOrg,
        isLive: nextOrg.isSandboxRestricted,
      },
      meta: { ...data.meta, isAssumed: true },
    });
  };

  const logOut = () => {
    reset();
  };

  const setUser = (nextUser: Partial<UserSession>) => {
    if (!data.user) return;
    update({
      user: {
        ...data.user,
        ...nextUser,
      },
    });
  };

  const setOrg = (nextOrg: Partial<Omit<OrgSession, 'isLive'>>) => {
    if (!data.org) return;
    update({
      org: {
        ...data.org,
        ...nextOrg,
      },
    });
  };

  const setIsLive = (newIsLive: boolean) => {
    if (!data.org) return;
    update({
      org: { ...data.org, isLive: newIsLive },
    });
  };

  const completeOnboarding = () => {
    update({
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
    isLive,
    setIsLive,
    setAssumedOrg,
    completeOnboarding,
  };
};

export default useSession;
