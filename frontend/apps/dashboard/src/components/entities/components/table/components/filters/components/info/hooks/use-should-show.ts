import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useShouldShow = create<{
  shouldShow: boolean;
  dismiss: () => void;
}>()(
  persist(
    set => ({
      shouldShow: true,
      dismiss: () => set({ shouldShow: false }),
    }),
    {
      version: 1,
      name: 'users-filters-info',
    },
  ),
);

export default useShouldShow;
