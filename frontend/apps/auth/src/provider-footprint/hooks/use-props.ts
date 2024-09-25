import { getTokenFromUrlHash, getWindowUrl, isTokenFormat } from '@onefootprint/core';
import { Logger, hasInvalidHashFragment } from '@onefootprint/idv';
import { useEffect, useState } from 'react';

import { useGetSdkArgs } from '@/src/queries';

import { useFootprintProvider } from '../provider';

type Obj = Record<string, unknown>;

/**
 * useProps is used in the following ways:
 * - Auth flow: https://auth.onefootprint.com/
 *   - (iframe and hosted) Where currently a `sdktok_` is expected in the hash fragment
 * - Update auth methods  flow: https://auth.onefootprint.com/user
 *   - (iframe) Where currently a `sdktok_` is expected in the hash fragment
 *   - (hosted) Where currently a `utok_` is expected in the hash fragment.
 *              This is the only reason we are checking for the format in the hash fragment.
 *              In a future iteration we need to implement the hosted version of the update auth flow in a different route
 */
const useProps = <T extends Obj>(onSuccess: (props?: T) => void, onError: (error: unknown) => void) => {
  const windowUrl = getWindowUrl();
  const fpProvider = useFootprintProvider();
  const urlFragmentToken = getTokenFromUrlHash(windowUrl);
  const sdkToken = urlFragmentToken?.startsWith('sdktok_') ? urlFragmentToken : '';
  const querySdkArgs = useGetSdkArgs<T>(sdkToken);
  const isSdkArgsLoading = querySdkArgs.isLoading && querySdkArgs.isFetching;
  const [isFpProviderLoaded, setIsFpProviderLoaded] = useState(false);

  useEffect(() => {
    fpProvider
      .load()
      .then(data => {
        setIsFpProviderLoaded(true);
        const sdkVersion = data?.model?.sdkVersion;
        if (sdkVersion) {
          Logger.appendGlobalContext({ sdkVersion: `footprint-js@${sdkVersion}` });
        }
      })
      .catch(error => {
        const msg = `Error loading Footprint Provider: ${error.message || error}`;
        console.error(msg);
        onError(new TypeError(msg));
      });
  }, []);

  useEffect(() => {
    if (!isFpProviderLoaded || isSdkArgsLoading) {
      return;
    }
    if (querySdkArgs.error) {
      return onError(querySdkArgs.error);
    }
    if (hasInvalidHashFragment(windowUrl)) {
      return onError(new TypeError('Invalid URL fragment'));
    }

    const sdkArgsData = querySdkArgs.isSuccess ? querySdkArgs.data : undefined;
    if (sdkArgsData) {
      return onSuccess(sdkArgsData.args.data);
    }

    if (!sdkToken && isTokenFormat(urlFragmentToken)) {
      return onSuccess({ authToken: urlFragmentToken } as unknown as T);
    }
  }, [isFpProviderLoaded, windowUrl, isSdkArgsLoading]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useProps;
