import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { TrackingProps, TrackingStorageState } from './use-tracking-storage.types';
import { defaultTracking } from './use-tracking-storage.types';

export const useStore = create<TrackingStorageState>()(
  persist(
    set => ({
      data: defaultTracking,
      reset: () => set({ data: defaultTracking }),
      update: (data: Partial<TrackingProps>) => {
        set(oldTracking => ({
          ...oldTracking,
          data: {
            ...oldTracking.data,
            ...data,
          },
        }));
      },
    }),
    {
      version: 1,
      name: 'tracking-session-storage',
    },
  ),
);

const useTrackingStorage = (): TrackingStorageState => {
  const { data, reset, update } = useStore(state => state);

  return {
    data,
    reset,
    update,
  };
};

export default useTrackingStorage;
