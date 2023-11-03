import type { FootprintClientGenerator } from '../types';

const generateEmptyAdapter: FootprintClientGenerator = () => {
  const load = (): Promise<void> => Promise.resolve();

  const close = (): void => {};

  const cancel = (): void => {};

  const on = () => () => {};

  const complete = (): void => {};

  return {
    load,
    cancel,
    close,
    complete,
    on,
  };
};

export default generateEmptyAdapter;
