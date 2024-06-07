import type FPCustomEvents from './constants';

export const isCustomEvent = <T>(x: unknown): x is CustomEvent<T> =>
  typeof x === 'object' && x instanceof CustomEvent && Boolean(x?.detail);

export const sendCustomEvent = (name: FPCustomEvents, detail: Record<string, unknown>): void => {
  if (typeof window === 'undefined') return;
  document.dispatchEvent(new CustomEvent(name, { detail }));
};
