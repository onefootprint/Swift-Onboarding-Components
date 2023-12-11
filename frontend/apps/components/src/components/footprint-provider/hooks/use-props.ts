import { FootprintPrivateEvent } from '@onefootprint/footprint-js';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import noop from 'lodash/noop';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { useFootprintProvider } from '../footprint-provider';
import useGetSdkArgs from './use-get-sdk-args';

// Wait for a bit for post message to arrive before giving up
const POST_MESSAGE_TIMEOUT = 500;

type Obj = Record<string, unknown>;

const useProps = <T extends Obj>(
  onSuccess?: (props?: T, config?: PublicOnboardingConfig) => void,
  onError?: (error: unknown) => void,
) => {
  // For legacy web SDKs that only pass args via postMessage
  // TODO: delete when all customers migrate to v3.8.0+
  const fpProvider = useFootprintProvider();
  const router = useRouter();
  const [isAdapterLoaded, setIsAdapterLoaded] = useState(false); // whether iframe adapter has loaded
  const onSuccessCalled = useRef(false); // Whether on success has been called with props
  const authTokenFromUrl = router.asPath.split('#')[1] ?? '';
  const sdkArgsQuery = useGetSdkArgs<T>(authTokenFromUrl, fpProvider);
  const isSdkArgsLoading = authTokenFromUrl && sdkArgsQuery.isLoading;
  const timerId = useRef<NodeJS.Timeout | undefined>();

  const complete = (props: T, config?: PublicOnboardingConfig) => {
    // If already received props, ignore
    if (onSuccessCalled.current) {
      return;
    }
    onSuccessCalled.current = true;
    onSuccess?.(props, config);
  };

  useEffectOnce(() => {
    fpProvider.load().then(() => {
      setIsAdapterLoaded(true);
    });
  });

  useEffect(() => {
    if (!isAdapterLoaded || !router.isReady || isSdkArgsLoading) {
      return noop;
    }

    if (onError && !isSdkArgsLoading && sdkArgsQuery.error) {
      onError(sdkArgsQuery.error);
    }

    // See if we can retrieve the SDK args from the API (for >=3.8.0 footprint-js integrations only)
    const sdkArgsData = sdkArgsQuery.isSuccess ? sdkArgsQuery.data : undefined;
    if (sdkArgsData) {
      complete(sdkArgsData.args.data, sdkArgsData.obConfig);
      return noop;
    }

    // TODO: delete when all customers migrate to v3.8.0+
    // If all else fails, we need to wait for post messages (for legacy web sdk integrations)
    if (timerId.current) {
      // If we already started a timer, we are already listening for post messages
      return noop;
    }

    // TODO: delete when all customers migrate to v3.8.0+
    const unsubscribe = fpProvider.on(
      FootprintPrivateEvent.propsReceived,
      (props: unknown) => {
        clearTimeout(timerId.current);
        complete(props as T);
      },
    );

    timerId.current = setTimeout(() => {
      unsubscribe();
      complete({} as T);
    }, POST_MESSAGE_TIMEOUT);

    return () => {
      unsubscribe();
      clearTimeout(timerId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAdapterLoaded,
    router.isReady,
    router.query,
    router.asPath,
    isSdkArgsLoading,
  ]);
};

export default useProps;
