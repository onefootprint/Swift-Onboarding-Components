import { FootprintPrivateEvent } from '@onefootprint/footprint-js';
import { useEffect, useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { useFootprintProvider } from '../footprint-provider';
import usePropsFromUrl from './use-props-from-url';

// Wait for a bit for post message to arrive before giving up
const POST_MESSAGE_TIMEOUT = 500;

type BaseProps = Record<string, any>;

const useProps = <T extends BaseProps>(
  onSuccess?: (props?: T | {}) => void,
) => {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  const footprintProvider = useFootprintProvider();

  // Will be set to undefined if still waiting on provider
  // Will be set to {} if not provided
  const [providerProps, setProviderProps] = useState<T | undefined>();
  const [urlProps, setUrlProps] = useState<T | undefined>();

  usePropsFromUrl((props: T) => {
    if (!urlProps) {
      setUrlProps(props);
    }
  });

  const clearTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  const getEffectiveProps = () => {
    const hasUrlProps = urlProps && Object.values(urlProps).length > 0;
    if (hasUrlProps) {
      return urlProps;
    }
    const hasProviderProps =
      providerProps && Object.values(providerProps).length > 0;
    if (hasProviderProps) {
      return providerProps;
    }
    return {};
  };

  const complete = () => {
    clearTimer();
    unsubscribe();
    onSuccess?.(getEffectiveProps());
  };

  const unsubscribe = footprintProvider.on(
    FootprintPrivateEvent.propsReceived,
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
    // Wait at least for the router to be ready before timing out
    if (!urlProps) {
      return clearTimer;
    }
    if (providerProps) {
      complete();
      return clearTimer;
    }
    if (timeoutId) {
      return clearTimer;
    }

    // The only case we want a timeout is when we already got props from
    // url but footprintProvider events haven't triggered
    // If post message doesn't arrive for a while, assume there is no props
    const timerId = setTimeout(() => {
      complete();
    }, POST_MESSAGE_TIMEOUT);
    setTimeoutId(timerId);

    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, urlProps, providerProps]);

  return providerProps;
};

export default useProps;
