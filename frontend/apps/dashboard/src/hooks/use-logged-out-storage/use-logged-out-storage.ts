import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_PUBLIC_ROUTE } from 'src/config/constants';
import type { LoggedOutStorageState, Session } from './use-logged-out-storage.types';
import { defaultSession } from './use-logged-out-storage.types';

export const useStore = create<LoggedOutStorageState>()(
  persist(
    set => ({
      data: defaultSession,
      reset: () =>
        set({
          data: defaultSession,
        }),
      update: (data: Partial<Session>) => {
        set(oldSession => ({
          ...oldSession,
          data: {
            ...oldSession.data,
            ...data,
          },
        }));
      },
    }),
    {
      version: 1,
      name: 'logged-out-storage',
    },
  ),
);

const useLoggedOutStorage = () => {
  const { data, reset, update } = useStore(state => state);

  // After login, redirect to the redirectUrl if it exists, otherwise DEFAULT_PUBLIC_ROUTE
  const onLoginUrl = data.redirectUrl ? decodeURIComponent(data.redirectUrl) : DEFAULT_PUBLIC_ROUTE;

  return {
    data,
    reset,
    update,
    onLoginUrl,
  };
};

export default useLoggedOutStorage;
