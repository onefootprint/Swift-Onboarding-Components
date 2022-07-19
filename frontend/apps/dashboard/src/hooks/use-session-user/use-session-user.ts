import create from 'zustand';
import { persist } from 'zustand/middleware';

import {
  DASHBOARD_AUTHORIZATION_HEADER,
  DASHBOARD_IS_LIVE_HEADER,
} from '../../config/constants';

export type UserSession = {
  auth: string;
  email: string;
};

export type AuthHeaders = {
  [DASHBOARD_AUTHORIZATION_HEADER]: string;
  [DASHBOARD_IS_LIVE_HEADER]: string;
};

type UserSessionState = {
  data?: UserSession;
  isLive?: boolean;
  returnUrl?: string;
  logIn: (data: UserSession) => void;
  logOut: () => void;
  setIsLive: (value: boolean) => void;
  setReturnUrl: (returnUrl?: string) => void;
};

export const useStore = create<UserSessionState>()(
  persist(set => ({
    data: undefined,
    returnUrl: undefined,
    isLive: true,
    logIn: (data: UserSession) => set({ data }),
    logOut: () => set({ data: undefined }),
    setIsLive: (value: boolean) => set({ isLive: value }),
    setReturnUrl: (returnUrl: string | undefined) => set({ returnUrl }),
  })),
);

const useSessionUser = () => {
  const { data, returnUrl, isLive, logIn, logOut, setIsLive, setReturnUrl } =
    useStore(state => state);
  const isLoggedIn = !!data;
  const authHeaders = {
    [DASHBOARD_AUTHORIZATION_HEADER]: data?.auth as string,
    [DASHBOARD_IS_LIVE_HEADER]: JSON.stringify(!!isLive),
  } as AuthHeaders;

  return {
    data,
    returnUrl,
    isLoggedIn,
    isLive,
    authHeaders,
    logIn,
    logOut,
    setIsLive,
    setReturnUrl,
  };
};

export default useSessionUser;
