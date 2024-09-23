import type { FootprintVerifyDataProps } from '@onefootprint/footprint-js';
import { Logger, getSdkArgsToken, hasInvalidHashFragment, useFootprintProvider } from '@onefootprint/idv';
import noop from 'lodash/noop';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import useGetSdkArgs from '../hooks/use-get-sdk-args';
import useMergeOnboardingSession from '../hooks/use-merge-onboarding-session';
import getPublicKeyFromUrl from './utils/get-public-key-from-url';

// See documentation:
// https://www.notion.so/onefootprint/SDK-Bifrost-Communication-e5fa05ddbfb34dc593b3e58a1398ad1c

type UsePropsProps = {
  onSuccess: (props: FootprintVerifyDataProps) => void;
  onError: (error: unknown) => void;
};

const useProps = ({ onSuccess, onError }: UsePropsProps) => {
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
      complete({ publicKey: publicKeyFromUrl });
      return noop;
    }
  }, [isAdapterLoaded, isSdkArgsLoading, router.asPath, router.isReady, router.query]);
};

export default useProps;
