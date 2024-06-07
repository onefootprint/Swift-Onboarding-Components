import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import { useToast } from '@onefootprint/ui';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  DASHBOARD_ALLOW_ASSUMED_WRITES,
  DASHBOARD_AUTHORIZATION_HEADER,
  DASHBOARD_IS_LIVE_HEADER,
} from '../../config/constants';
import { getOrgMemberRequest } from '../use-get-org-member/use-get-org-member';
import useLoggedOutStorage from '../use-logged-out-storage';
import type {
  AuthHeaders,
  MetaSession,
  OrgSession,
  Session,
  UserSession,
  UserSessionState,
} from './user-session.types';
import { defaultSession } from './user-session.types';

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
      version: 13,
      name: 'dashboard-storage',
    },
  ),
);

const useSession = () => {
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();
  const { setOrgId: setRequestedOrgId } = useLoggedOutStorage();
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
  const isAssumedSessionEditMode = !!data.user?.isAssumedSessionEditMode;

  const authHeaders = {
    [DASHBOARD_AUTHORIZATION_HEADER]: data?.auth as string,
    [DASHBOARD_IS_LIVE_HEADER]: JSON.stringify(isLive),
  } as AuthHeaders;
  if (isAssumedSessionEditMode) {
    authHeaders[DASHBOARD_ALLOW_ASSUMED_WRITES] = JSON.stringify(true);
  }

  const logIn = async (session: {
    auth: string;
    meta?: MetaSession;
    newIsLive?: boolean;
  }) => {
    // Update local storage with the auth and meta ASAP
    update({ auth: session.auth });
    if (session.meta) {
      update({ meta: session.meta });
    }
    setRequestedOrgId(undefined);
    // Then asynchronously fetch user and tenant info from the backend for the new auth
    await refreshPermissions({
      newAuthToken: session.auth,
      newIsLive: session.newIsLive ?? isLive,
    });
  };

  const refreshPermissions = async ({
    newAuthToken,
    newIsLive,
    newIsAssumedSessionEditMode,
  }: {
    newAuthToken: string;
    newIsLive: boolean;
    newIsAssumedSessionEditMode?: boolean;
  }) => {
    try {
      // Fetch the new permissions from the backend
      const user = await getOrgMemberRequest({
        auth: newAuthToken,
        isLive: newIsLive,
        isAssumedSessionEditMode: !!newIsAssumedSessionEditMode,
      });

      if (user.tenant.isSandboxRestricted && newIsLive) {
        // If we requested to login in live mode but the tenant is sandbox restricted, re-login
        // in sandbox mode
        toast.show({
          title: 'Switched to sandbox mode',
          description: "This organization doesn't have live mode enabled.",
        });
        await refreshPermissions({
          newAuthToken,
          newIsLive: false,
          newIsAssumedSessionEditMode,
        });
        return;
      }

      update({
        user: {
          ...user,
          isAssumedSession: !!user.isAssumedSession,
          isAssumedSessionEditMode: !!newIsAssumedSessionEditMode,
        },
        org: {
          ...user.tenant,
          isLive: newIsLive,
        },
      });
    } catch (error: unknown) {
      // If we can't fetch the user from the backend, just log out and display a toast
      logOut();
      showRequestErrorToast(error);
    }
  };

  const logOut = () => {
    if (data.auth) {
      // eslint-disable-next-line no-console
      logoutUser(data.auth).catch(console.error);
    }
    reset();
  };

  const updateUserName = (nextUser: Pick<UserSession, 'firstName' | 'lastName'>) => {
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

  const setAssumedSessionEditMode = async (newEditMode: boolean) => {
    if (!data?.auth) return;
    // Fetch the permissions from the backend with the newEditMode - the backend will properly
    // render and apply permissions as requested
    await refreshPermissions({
      newAuthToken: data.auth,
      newIsLive: isLive,
      newIsAssumedSessionEditMode: newEditMode,
    });
  };

  const setIsLive = async (newIsLive: boolean) => {
    if (!data.auth) return;
    await refreshPermissions({
      newAuthToken: data.auth,
      newIsLive,
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
    updateUserName,
    isLive,
    setIsLive,
    isAssumedSessionEditMode,
    setAssumedSessionEditMode,
    completeOnboarding,
  };
};

export default useSession;
