import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SessionData = { authToken: string };

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
      version: 0,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

const useSession = () => {
  const { reset, update, data } = useStore(state => state);
  const isLoggedIn = !!data;

  const logIn = async (authToken: string) => {
    update({ authToken });
  };

  const logOut = () => {
    reset();
  };

  return { data, isLoggedIn, logIn, logOut };
};

export default useSession;
