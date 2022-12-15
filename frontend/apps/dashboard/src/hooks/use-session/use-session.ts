import create from 'zustand';
import { persist } from 'zustand/middleware';

import {
  DASHBOARD_AUTHORIZATION_HEADER,
  DASHBOARD_IS_LIVE_HEADER,
} from '../../config/constants';
import migrations from './migrations';

export type Session = {
  auth: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  org: {
    name: string;
    sandboxRestricted: boolean;
    isLive: boolean;
  };
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
    migrations,
  ),
);

const useSession = () => {
  const { data, reset, update } = useStore(state => state);
  const dangerouslyCastedData = data as Session;
  const isLoggedIn = !!data;
  const authHeaders = {
    [DASHBOARD_AUTHORIZATION_HEADER]: data?.auth as string,
    [DASHBOARD_IS_LIVE_HEADER]: JSON.stringify(!!data?.org.isLive),
  } as AuthHeaders;

  const logIn = (nextData: Session) => {
    update(nextData);
  };

  const logOut = () => {
    reset();
  };

  const setOrg = (nextOrg: Partial<Session['org']>) => {
    if (!data) return;
    update({
      ...data,
      org: { ...data.org, ...nextOrg },
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
    update,
  };
};

export default useSession;
