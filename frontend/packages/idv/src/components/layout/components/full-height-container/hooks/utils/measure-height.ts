export const isClient = () => typeof window !== 'undefined' && typeof document !== 'undefined';

export const measureHeight = () => {
  if (!isClient()) return null;
  return window.innerHeight;
};
