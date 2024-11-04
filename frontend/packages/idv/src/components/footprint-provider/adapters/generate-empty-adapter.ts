import { Logger } from '@/idv/utils';
import type { EmptyAdapterReturn } from '../types';

const generateEmptyAdapter = (): EmptyAdapterReturn => {
  const load = (): Promise<void> => {
    Logger.info('Loading footprint from empty adapter');
    return Promise.resolve();
  };

  const auth = (): void => {
    Logger.info('Challenge token authentication from empty adapter');
  };

  const relayToComponents = (): void => {
    Logger.info('relayToComponents from empty adapter');
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
    relayToComponents,
    auth,
    cancel,
    close,
    complete,
    on,
  };
};

export default generateEmptyAdapter;
