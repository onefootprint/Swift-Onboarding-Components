import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { OrgMemberResponse } from '@onefootprint/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  DASHBOARD_AUTHORIZATION_HEADER,
  DASHBOARD_IS_LIVE_HEADER,
} from '../../config/constants';
import type {
  AuthHeaders,
  MetaSession,
  OrgSession,
  Session,
  UserSession,
  UserSessionState,
} from './user-session.types';
import { defaultSession } from './user-session.types';

const getUser = async (auth: string) => {
  const response = await request<OrgMemberResponse>({
    headers: {
      [DASHBOARD_AUTHORIZATION_HEADER]: auth,
    },
    method: 'GET',
    url: '/org/member',
  });

  return response.data;
};

const logoutUser = (auth: string) =>
  request({
    headers: {
      [DASHBOARD_AUTHORIZATION_HEADER]: auth,
    },
    method: 'POST',
    url: '/org/auth/logout',
  });

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
      version: 12,
      name: 'dashboard-storage',
    },
  ),
);

const useSession = () => {
  const showRequestErrorToast = useRequestErrorToast();
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

  const logIn = async (session: { auth: string; meta?: MetaSession }) => {
    // Update local storage with the auth and meta ASAP
    update({ auth: session.auth });
    if (session.meta) {
      update({ meta: session.meta });
    }
    // Then asynchronously fetch user and tenant info from the backend for the new auth
    await refreshPermissions(session.auth);
  };

  const refreshPermissions = async (authToken: string) => {
    try {
      const user = await getUser(authToken);
      update({
        user: {
          ...user,
          isAssumedSession: !!user.isAssumedSession,
        },
        org: {
          ...user.tenant,
          isLive: !user.tenant.isSandboxRestricted,
        },
      });
    } catch (error: unknown) {
      // If we can't fetch the user from the backend, just log out and display a toast
      logOut();
      showRequestErrorToast(error);
      console.error(error);
    }
  };

  const refreshUserPermissions = async () => {
    if (!data.auth) return;
    await refreshPermissions(data.auth);
  };

  const logOut = () => {
    if (data.auth) {
      // eslint-disable-next-line no-console
      logoutUser(data.auth).catch(console.error);
    }
    reset();
  };

  const updateUserName = (
    nextUser: Pick<UserSession, 'firstName' | 'lastName'>,
  ) => {
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
    refreshUserPermissions,
    logIn,
    logOut,
    setOrg,
    updateUserName,
    isLive,
    setIsLive,
    completeOnboarding,
  };
};

export default useSession;
