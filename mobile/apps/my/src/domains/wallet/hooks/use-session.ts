import type { ChallengeKind } from '@onefootprint/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AUTH_HEADER } from '@/config/constants';

export type AuthHeaders = {
  'x-fp-authorization': string;
};

export type SessionData = {
  isApple: boolean;
  authToken: string;
  challengeKind: ChallengeKind;
};

export type Session = {
  data?: SessionData;
  update: (data: Partial<SessionData>) => void;
  reset: () => void;
};

const initialData: SessionData = undefined;

export const useStore = create<Session>()(
  persist(
    set => ({
      data: initialData,
      reset: () => {
        set(() => ({ data: initialData }));
      },
      update: (newData: Partial<SessionData>) => {
        set(session => ({
          data: {
            ...session.data,
            ...newData,
          },
        }));
      },
    }),
    {
      name: 'my',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

const useSession = () => {
  const { reset, update, data } = useStore(state => state);
  const isLoggedIn = !!data;
  const authHeaders = { [AUTH_HEADER]: data?.authToken };

  const logIn = async (challengeKind: ChallengeKind, authToken: string, isApple: boolean) => {
    update({ challengeKind, authToken, isApple });
  };

  const logOut = () => {
    reset();
  };

  return { authHeaders, data, isLoggedIn, logIn, logOut };
};

export default useSession;
