import type { FootprintVerifyDataProps } from '@onefootprint/footprint-js';
import { FootprintPrivateEvent } from '@onefootprint/footprint-js';
import { Logger, getSdkArgsToken, hasInvalidHashFragment, useFootprintProvider } from '@onefootprint/idv';
import noop from 'lodash/noop';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import useGetSdkArgs from '../hooks/use-get-sdk-args';
import useMergeOnboardingSession from '../hooks/use-merge-onboarding-session';
import getMobilePropsFromUrl from './utils/get-mobile-props-from-url';
import getPublicKeyFromUrl from './utils/get-public-key-from-url';

// See documentation:
// https://www.notion.so/onefootprint/SDK-Bifrost-Communication-e5fa05ddbfb34dc593b3e58a1398ad1c

// For legacy web SDKs that only pass args via postMessage
// TODO: delete when all customers migrate to v3.8.0+
export const POST_MESSAGE_TIMEOUT = 1000;

export type UsePropsProps = {
  onSuccess: (props: FootprintVerifyDataProps) => void;
  onError: (error: unknown) => void;
};

const useProps = ({ onSuccess, onError }: UsePropsProps) => {
  // For legacy web SDKs that only pass args via postMessage
  // TODO: delete when all customers migrate to v3.8.0+
  const fpProvider = useFootprintProvider();
  const router = useRouter();
  const [isAdapterLoaded, setIsAdapterLoaded] = useState(false); // whether iframe adapter has loaded
  const onSuccessCalled = useRef(false); // Whether on success has been called with props
  const sdkArgsToken = getSdkArgsToken(router.asPath.split('#')[1] ?? '');
  const sdkArgsQuery = useGetSdkArgs(sdkArgsToken, fpProvider);
  const isSdkArgsLoading = sdkArgsQuery.isLoading && sdkArgsQuery.isFetching; // `isLoading` is true right from the start; `isFetching` is controlled by `enabled` property
  const mergeOnboardingSession = useMergeOnboardingSession();

  const complete = (props: FootprintVerifyDataProps) => {
    // If already received props, ignore
    if (onSuccessCalled.current) {
      return;
    }
    onSuccessCalled.current = true;
    onSuccess(props);
  };

  const timerId = useRef<ReturnType<typeof setTimeout>>();

  useEffectOnce(() => {
    fpProvider.load().then(data => {
      const sdkVersion = data?.model?.sdkVersion;
      if (sdkVersion) {
        Logger.appendGlobalContext({ sdkVersion: `footprint-js@${sdkVersion}` });
      }

      Logger.info('Footprint provider successfully loaded');
      setIsAdapterLoaded(true);
    });
  });

  useEffect(() => {
    if (!isAdapterLoaded || !router.isReady || isSdkArgsLoading) {
      return noop;
    }

    if (sdkArgsQuery.error) {
      onError(sdkArgsQuery.error);
    } else if (hasInvalidHashFragment(router.asPath)) {
      onError(new TypeError('Invalid URL fragment'));
    }

    // See if we can retrieve the SDK args from the API (for >=3.8.0 footprint-js integrations only)
    const sdkArgsData = sdkArgsQuery.isSuccess ? sdkArgsQuery.data : undefined;
    if (sdkArgsData) {
      const {
        args: { data },
      } = sdkArgsData;
      mergeOnboardingSession(data)
        .then(mergedData => complete(mergedData))
        .catch(onError);
      return noop;
    }

    // See if we are running against a mobile SDK thta is sending data in URL fragment
    const publicKeyFromUrl = getPublicKeyFromUrl(router.query) ?? '';
    if (publicKeyFromUrl) {
      Logger.info(`Public key received from URL query: ${publicKeyFromUrl}`);
    }
    const mobileProps = getMobilePropsFromUrl(router.asPath);
    if (mobileProps) {
      Logger.info(`Mobile props received from URL fragment with keys: ${Object.keys(mobileProps).join(', ')}`);
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

    Logger.info('Subscribing to post messages for props');
    const unsubscribe = fpProvider.on(FootprintPrivateEvent.propsReceived, (props: unknown) => {
      if (typeof props === 'object') {
        const keys = Object.keys(props ?? {});
        Logger.info(`Found props in post message with keys: ${keys.join(', ')}`);
      }

      clearTimeout(timerId.current);
      complete({
        publicKey: publicKeyFromUrl,
        ...(props as Partial<FootprintVerifyDataProps>),
      });
    });

    timerId.current = setTimeout(() => {
      Logger.info('Timed out waiting for props from post message');
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
  }, [isAdapterLoaded, router.isReady, router.query, router.asPath, isSdkArgsLoading]);
};

export default useProps;
