import create from 'zustand';
import { persist } from 'zustand/middleware';

export type UserSession = {
  auth: string;
  email: string;
};

type UserSessionState = {
  data?: UserSession;
  returnUrl?: string;
  logIn: (data: UserSession) => void;
  logOut: () => void;
  setReturnUrl: (returnUrl?: string) => void;
};

export const useStore = create<UserSessionState>()(
  persist(set => ({
    data: undefined,
    returnUrl: undefined,
    logIn: (data: UserSession) => set({ data }),
    logOut: () => set({ data: undefined }),
    setReturnUrl: (returnUrl: string | undefined) => set({ returnUrl }),
  })),
);

const useSessionUser = () => {
  const { data, returnUrl, logIn, logOut, setReturnUrl } = useStore(
    state => state,
  );
  const isLoggedIn = !!data;

  return { data, returnUrl, isLoggedIn, logIn, logOut, setReturnUrl };
};

export default useSessionUser;
