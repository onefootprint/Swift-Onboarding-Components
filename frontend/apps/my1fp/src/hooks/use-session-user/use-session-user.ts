import create from 'zustand';
import { persist } from 'zustand/middleware';

export type UserSessionBiometric = {
  isBiometricsVerified?: boolean;
  device?: string;
};

export type UserSessionMetadata = {
  hasSSNFilled?: boolean;
  isEmailVerified?: boolean;
  wasLoggedUsingBiometrics?: boolean;
};

export type UserSessionData = {
  firstName: string | null;
  lastName: string | null;
  dob: string | null;
  phoneNumber: string | null;
  email: string;
  streetAddress: string | null;
  streetAddress2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip: string | null;
  ssn?: string | null;
};

export type UserSession = {
  data: UserSessionData;
  biometric: UserSessionBiometric;
  metadata: UserSessionMetadata;
  authToken: string;
};

type UserSessionState = {
  session?: UserSession;
  logIn: (data: UserSession) => void;
  logOut: () => void;
  updateData: (data: UserSessionData) => void;
  updateBiometric: (biometric: UserSessionBiometric) => void;
  updateMetadata: (metadata: UserSessionMetadata) => void;
};

const initialMe = undefined;

export const useStore = create<UserSessionState>()(
  persist(set => ({
    session: initialMe,
    logIn: (session: UserSession) => set({ session }),
    logOut: () => set({ session: undefined }),
    updateData: (data: UserSessionData) => {
      set(state => {
        const { session } = state;
        if (session) {
          session.data = { ...data };
        }
        return state;
      });
    },
    updateBiometric: (biometric: UserSessionBiometric) => {
      set(state => {
        const { session } = state;
        if (session) {
          session.biometric = { ...biometric };
        }
        return state;
      });
    },
    updateMetadata: (metadata: UserSessionMetadata) => {
      set(state => {
        const { session } = state;
        if (session) {
          session.metadata = { ...metadata };
        }
        return state;
      });
    },
  })),
);

const useSessionUser = () => {
  const {
    session,
    logIn,
    logOut,
    updateData,
    updateBiometric,
    updateMetadata,
  } = useStore(state => state);
  const isLoggedIn = !!session;

  return {
    session,
    isLoggedIn,
    logIn,
    logOut,
    updateData,
    updateBiometric,
    updateMetadata,
  };
};

export default useSessionUser;
