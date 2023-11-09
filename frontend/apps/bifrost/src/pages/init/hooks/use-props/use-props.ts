import type { FootprintVerifyDataProps } from '@onefootprint/footprint-js';
import { FootprintPrivateEvent } from '@onefootprint/footprint-js';
import { useFootprintProvider } from '@onefootprint/idv-elements';
import noop from 'lodash/noop';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import useGetSdkArgs from '../hooks/use-get-sdk-args';
import getMobilePropsFromUrl from './utils/get-mobile-props-from-url';
import getPublicKeyFromUrl from './utils/get-public-key-from-url';

// See documentation:
// https://www.notion.so/onefootprint/SDK-Bifrost-Communication-e5fa05ddbfb34dc593b3e58a1398ad1c

// For legacy web SDKs that only pass args via postMessage
// TODO: delete when all customers migrate to v3.8.0+
const POST_MESSAGE_TIMEOUT = 1000;

const useProps = (onSuccess: (props: FootprintVerifyDataProps) => void) => {
  const router = useRouter();
  const [isAdapterLoaded, setIsAdapterLoaded] = useState(false); // whether iframe adapter has loaded
  const onSuccessCalled = useRef(false); // Whether on success has been called with props
  const authTokenFromUrl = router.asPath.split('#')[1] ?? '';
  const sdkArgsQuery = useGetSdkArgs(authTokenFromUrl);
  const isSdkArgsLoading = authTokenFromUrl && sdkArgsQuery.isLoading;

  const complete = (props: FootprintVerifyDataProps) => {
    // If already received props, ignore
    if (onSuccessCalled.current) {
      return;
    }
    onSuccessCalled.current = true;
    onSuccess(props);
  };

  // For legacy web SDKs that only pass args via postMessage
  // TODO: delete when all customers migrate to v3.8.0+
  const footprintProvider = useFootprintProvider();
  const timerId = useRef<NodeJS.Timeout | undefined>();

  useEffectOnce(() => {
    footprintProvider.load().then(() => {
      setIsAdapterLoaded(true);
    });
  });

  useEffect(() => {
    if (!isAdapterLoaded || !router.isReady || isSdkArgsLoading) {
      return noop;
    }

    // See if we can retrieve the SDK args from the API (for >=3.8.0 footprint-js integrations only)
    const sdkArgsData = sdkArgsQuery.isSuccess ? sdkArgsQuery.data : undefined;
    if (sdkArgsData) {
      const {
        args: { data },
      } = sdkArgsData;
      complete(data);
      return noop;
    }

    // See if we are running against a mobile SDK thta is sending data in URL fragment
    const publicKeyFromUrl = getPublicKeyFromUrl(router.query) ?? '';
    const mobileProps = getMobilePropsFromUrl(router.asPath);
    if (mobileProps) {
      complete({
        publicKey: publicKeyFromUrl,
        ...mobileProps,
      });
      return noop;
    }

    // If all else fails, we need to wait for post messages (for legacy web sdk integrations)
    if (timerId.current) {
      // If we already started a timer, we are already listening for post messages
      return noop;
    }

    const unsubscribe = footprintProvider.on(
      FootprintPrivateEvent.propsReceived,
      (props: unknown) => {
        clearTimeout(timerId.current);
        complete({
          publicKey: publicKeyFromUrl,
          ...(props as Partial<FootprintVerifyDataProps>),
        });
      },
    );

    timerId.current = setTimeout(() => {
      unsubscribe();
      complete({
        publicKey: publicKeyFromUrl,
      });
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
