import {
  FootprintInternalEvent,
  useFootprintProvider,
} from '@onefootprint/idv-elements';
import { IdvBootstrapData, IdvOptions } from '@onefootprint/types';
import { useEffect, useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import useArgsFromUrl from './hooks/use-args-from-url';
import parseBootstrapData from './utils/parse-bootstrap-data';

// Wait for a bit for post message to arrive before giving up
const POST_MESSAGE_TIMEOUT = 500;

// Both of these args can be either in url or come via post message from provider
type FootprintProviderArgs = {
  bootstrapData: IdvBootstrapData;
  options: IdvOptions;
};

const useFootprintProviderArgs = (
  onSuccess: (args: FootprintProviderArgs) => void,
) => {
  const urlArgs = useArgsFromUrl();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  const footprintProvider = useFootprintProvider();

  // Will be set to undefined if still waiting on provider
  // Will be set to {} if not provided
  const [providerBootstrapData, setProviderBootstrapData] = useState<
    IdvBootstrapData | undefined
  >();
  const [providerOptions, setProviderOptions] = useState<
    IdvOptions | undefined
  >();

  // Will be set to undefined if haven't completed parsing url
  // Will be set to {} if not provided in url
  const { options: urlOptions, bootstrapData: urlBootstrapData } =
    urlArgs || {};

  const unsubscribeBootstrap = footprintProvider.on(
    FootprintInternalEvent.bootstrapDataReceived,
    (data: IdvBootstrapData) => {
      const parsed = parseBootstrapData(data);
      setProviderBootstrapData(parsed);
    },
  );

  const unsubscribeOptions = footprintProvider.on(
    FootprintInternalEvent.optionsReceived,
    (data: IdvOptions) => {
      setProviderOptions(data);
    },
  );

  // If we have bootstrap data from footprint provider, use that
  const getEffectiveBootstrapData = () => {
    const hasProviderData =
      providerBootstrapData && Object.values(providerBootstrapData).length > 0;
    if (hasProviderData) {
      return providerBootstrapData;
    }
    const hasUrlData =
      urlBootstrapData && Object.values(urlBootstrapData).length > 0;
    if (hasUrlData) {
      return urlBootstrapData;
    }
    return {};
  };

  // If we have options from footprint provider, use that
  const getEffectiveOptions = () => {
    const hasProviderOptions =
      providerOptions && Object.values(providerOptions).length > 0;
    if (hasProviderOptions) {
      return providerOptions;
    }
    const hasUrlOptions = urlOptions && Object.values(urlOptions).length > 0;
    if (hasUrlOptions) {
      return urlOptions;
    }
    return {};
  };

  const clearTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  const complete = () => {
    clearTimer();
    unsubscribeBootstrap();
    unsubscribeOptions();
    onSuccess({
      bootstrapData: getEffectiveBootstrapData(),
      options: getEffectiveOptions(),
    });
  };

  useEffectOnce(() => {
    footprintProvider.load().then(() => {
      setIsLoaded(true);
    });
  });

  useEffect(() => {
    // Don't time out on footprint provider events if it hasn't even loaded yet
    if (!isLoaded) {
      return clearTimer;
    }
    // Wait at least for the router to be ready before timing out
    if (!urlBootstrapData || !urlOptions) {
      return clearTimer;
    }
    if (providerBootstrapData || providerOptions) {
      complete();
      return clearTimer;
    }
    if (timeoutId) {
      return clearTimer;
    }
    // The only case we want a timeout is when we already got bootstrap data & options from
    // url but footprintProvider events haven't triggered
    // If post message doesn't arrive for a while, assume there is no bootstrap data / options
    const timerId = setTimeout(() => {
      complete();
    }, POST_MESSAGE_TIMEOUT);
    setTimeoutId(timerId);

    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoaded,
    urlBootstrapData,
    urlOptions,
    providerBootstrapData,
    providerOptions,
  ]);
};

export default useFootprintProviderArgs;
