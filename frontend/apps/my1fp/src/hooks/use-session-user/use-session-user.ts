import { InsightEvent } from '@onefootprint/types';
import create from 'zustand';
import { persist } from 'zustand/middleware';

export type UserSessionBiometric = InsightEvent[];

export type UserIdentification = {
  id: string;
  priority: 'primary' | 'secondary';
  isVerified: boolean;
};

export type UserSessionMetadata = {
  wasLoggedUsingBiometrics?: boolean;
  emails: UserIdentification[];
  phoneNumbers: UserIdentification[];
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

const emptySession: UserSession = {
  data: {
    firstName: null,
    lastName: null,
    dob: null,
    phoneNumber: null,
    email: '',
    streetAddress: null,
    streetAddress2: null,
    city: null,
    state: null,
    country: null,
    zip: null,
  },
  authToken: '',
  metadata: {
    emails: [],
    phoneNumbers: [],
  },
  biometric: [],
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
  persist(
    set => ({
      session: initialMe,
      logIn: (session: UserSession) => set({ session }),
      logOut: () => set({ session: undefined }),
      updateData: (data: UserSessionData) => {
        set(state => {
          const newState = { ...state };
          if (!newState.session) {
            newState.session = emptySession;
          }
          newState.session!.data = { ...data };
          return newState;
        });
      },
      updateBiometric: (biometric: UserSessionBiometric) => {
        set(state => {
          const newState = { ...state };
          if (!newState.session) {
            newState.session = emptySession;
          }
          newState.session!.biometric = [...biometric];
          return newState;
        });
      },
      updateMetadata: (metadata: UserSessionMetadata) => {
        set(state => {
          const newState = { ...state };
          if (!newState.session) {
            newState.session = emptySession;
          }
          newState.session!.metadata = { ...metadata };
          return newState;
        });
      },
    }),
    {
      version: 1,
      name: 'my1fp-storage',
    },
  ),
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
