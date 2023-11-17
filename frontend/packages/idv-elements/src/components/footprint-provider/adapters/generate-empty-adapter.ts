import Logger from '../../../utils/logger';
import type { FootprintClientGenerator } from '../types';

const generateEmptyAdapter: FootprintClientGenerator = () => {
  const load = (): Promise<void> => {
    Logger.info('Loading footprint from empty adapter');
    return Promise.resolve();
  };

  const close = (): void => {
    Logger.info('Closing footprint from empty adapter');
  };

  const cancel = (): void => {
    Logger.info('Canceling footprint from empty adapter');
  };

  const on = () => () => {
    Logger.info('Setting location from empty adapter');
  };

  const complete = (): void => {
    Logger.info('Completing footprint from empty adapter');
  };

  return {
    load,
    cancel,
    close,
    complete,
    on,
  };
};

export default generateEmptyAdapter;
