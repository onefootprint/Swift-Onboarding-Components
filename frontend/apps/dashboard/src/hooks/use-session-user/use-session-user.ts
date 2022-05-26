import create from 'zustand';
import { persist } from 'zustand/middleware';

export type UserSession = {
  id: string;
  firstName: string;
  lastName: string;
};

type UserSessionState = {
  data?: UserSession;
  logIn: (data: UserSession) => void;
  logOut: () => void;
};

const initialMe = undefined;

export const useStore = create<UserSessionState>()(
  persist(set => ({
    data: initialMe,
    logIn: (data: UserSession) => set({ data }),
    logOut: () => set({ data: undefined }),
  })),
);

const useSessionUser = () => {
  const { data, logIn, logOut } = useStore(state => state);
  const isLoggedIn = !!data;
  return { data, isLoggedIn, logIn, logOut };
};

export default useSessionUser;
