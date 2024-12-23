import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type HasShown2024WrappedState = {
  hasShown2024Wrapped: boolean;
  markAsShown2024Wrapped: () => void;
};

export const useStore = create<HasShown2024WrappedState>()(
  persist(
    set => ({
      hasShown2024Wrapped: false,
      markAsShown2024Wrapped: () => set({ hasShown2024Wrapped: true }),
    }),
    {
      version: 1,
      name: 'has-shown-2024-wrapped',
    },
  ),
);

const useHasShown2024Wrapped = () => {
  const { hasShown2024Wrapped, markAsShown2024Wrapped } = useStore(state => state);
  return { hasShown2024Wrapped, markAsShown2024Wrapped, useStore };
};

export default useHasShown2024Wrapped;
