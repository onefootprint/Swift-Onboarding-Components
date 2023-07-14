import { FootprintComponentsEvent } from '@onefootprint/footprint-components-js';
import { useEffect, useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { useFootprintProvider } from '..';

// Wait for a bit for post message to arrive before giving up
const POST_MESSAGE_TIMEOUT = 500;

type BaseProps = Record<string, any>;

const useProps = <T extends BaseProps>(onSuccess?: (props?: T) => void) => {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  const footprintProvider = useFootprintProvider();

  // Will be set to undefined if still waiting on provider
  // Will be set to {} if not provided
  const [providerProps, setProviderProps] = useState<T | undefined>();

  const clearTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  const complete = () => {
    clearTimer();
    unsubscribe();
    onSuccess?.(providerProps);
  };

  const unsubscribe = footprintProvider.on(
    FootprintComponentsEvent.propsReceived,
    (data: T) => {
      setProviderProps(data);
    },
  );

  useEffectOnce(() => {
    footprintProvider.load().then(() => {
      setIsLoaded(true);
    });
  });

  useEffect(() => {
    if (providerProps) {
      complete();
      return clearTimer;
    }
    if (timeoutId) {
      return clearTimer;
    }

    // If post message doesn't arrive for a while, assume there is no bootstrap data / options
    const timerId = setTimeout(() => {
      complete();
    }, POST_MESSAGE_TIMEOUT);
    setTimeoutId(timerId);

    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, providerProps]);

  return providerProps;
};

export default useProps;
