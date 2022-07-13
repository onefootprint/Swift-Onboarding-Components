import create from 'zustand';
import { persist } from 'zustand/middleware';

export type UserSession = {
  authToken: string;
  city: string | null;
  country: string | null;
  device?: string;
  dob: string | null;
  email: string;
  firstName: string | null;
  hasSSNFilled?: boolean;
  isBiometricsVerified?: boolean;
  isEmailVerified?: boolean;
  lastName: string | null;
  phoneNumber: string | null;
  ssn?: string | null;
  state: string | null;
  streetAddress: string | null;
  streetAddress2: string | null;
  wasLoggedUsingBiometrics?: boolean;
  zip: string | null;
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
