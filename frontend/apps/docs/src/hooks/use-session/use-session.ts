import request from '@onefootprint/request';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useRequestErrorToast } from '@onefootprint/hooks';
import { OrgMemberResponse } from '@onefootprint/types';
import type { Session, SessionState } from './use-session.types';
import { defaultSession } from './use-session.types';

const DASHBOARD_AUTHORIZATION_HEADER = 'x-fp-dashboard-authorization';
const DASHBOARD_IS_LIVE_HEADER = 'x-is-live';

export const getOrgMemberRequest = async (auth: string) => {
  const headers = {
    [DASHBOARD_AUTHORIZATION_HEADER]: auth,
    [DASHBOARD_IS_LIVE_HEADER]: JSON.stringify(false),
  };
  const response = await request<OrgMemberResponse>({
    headers,
    method: 'GET',
    url: '/org/member',
  });

  return response.data;
};

export const useStore = create<SessionState>()(
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
      version: 1,
      name: 'docs-storage',
    },
  ),
);

const useSession = () => {
  const { data, reset, update } = useStore(state => state);
  const showRequestErrorToast = useRequestErrorToast();

  const logIn = async (session: {
    authToken: string;
  }) => {
    // Update local storage with the auth and meta ASAP
    update({ authToken: session.authToken });
    // Then asynchronously fetch user and tenant info from the backend for the new auth
    await refreshPermissions(session.authToken);
  };

  const refreshPermissions = async (newAuthToken?: string) => {
    const authToken = newAuthToken || data.authToken;
    if (!authToken) {
      return;
    }
    try {
      // Fetch the new permissions from the backend
      const user = await getOrgMemberRequest(authToken);
      update({ user });
    } catch (error: unknown) {
      // If we can't fetch the user from the backend, just log out and display a toast
      logOut();
      showRequestErrorToast(error);
      throw error;
    }
  };

  const logOut = () => {
    reset();
  };

  const isLoggedIn = !!data.authToken;

  return {
    data,
    isLoggedIn,
    reset,
    logIn,
    logOut,
    refreshPermissions,
  };
};

export default useSession;
