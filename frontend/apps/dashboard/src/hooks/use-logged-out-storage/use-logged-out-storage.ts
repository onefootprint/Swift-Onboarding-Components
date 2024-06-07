import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { LoggedOutStorageState, Session } from './use-logged-out-storage.types';
import { defaultSession } from './use-logged-out-storage.types';

// TODO Should we just reuse useSession?
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

  const setOrgId = (orgId?: string) => update({ orgId });

  return {
    data,
    reset,
    setOrgId,
  };
};

export default useLoggedOutStorage;
