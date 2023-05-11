import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  addAuthTokenToRequest,
  removeAuthTokenToRequest,
} from '../utils/assing-default-headers';

export type SessionData = { authToken: string };

export type Session = {
  data?: SessionData;
  update: (data: Partial<SessionData>) => void;
  reset: () => void;
};

const initialState: SessionData = undefined;

export const useStore = create<Session>()(
  persist(
    set => ({
      data: initialState,
      reset: () => {
        set({ data: initialState });
      },
      update: (data: Partial<Session>) => {
        set(currentSession => ({
          ...currentSession,
          ...data,
        }));
      },
    }),
    {
      name: 'my',
      version: 0,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

const useSession = () => {
  const { reset, update, ...data } = useStore(state => state);
  const isLoggedIn = !!data;

  const logIn = async (authToken: string) => {
    addAuthTokenToRequest(authToken);
    update({ authToken });
  };

  const logOut = () => {
    removeAuthTokenToRequest();
    reset();
  };

  return { data, isLoggedIn, logIn, logOut };
};

export default useSession;
