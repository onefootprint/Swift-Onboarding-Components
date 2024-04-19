import { getWindowUrl } from '@onefootprint/core';
import { getSdkArgsToken, hasInvalidHashFragment } from '@onefootprint/idv';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { useEffect, useState } from 'react';

import { useGetSdkArgs } from '@/src/queries';

import { useFootprintProvider } from '../provider';

type Obj = Record<string, unknown>;

const useProps = <T extends Obj>(
  onSuccess: (props?: T, config?: PublicOnboardingConfig) => void,
  onError: (error: unknown) => void,
) => {
  const windowUrl = getWindowUrl();
  const fpProvider = useFootprintProvider();
  const sdkArgsToken = getSdkArgsToken(windowUrl.split('#')[1]) ?? '';
  const querySdkArgs = useGetSdkArgs<T>(sdkArgsToken, fpProvider);
  const isSdkArgsLoading = querySdkArgs.isLoading && querySdkArgs.isFetching;
  const [isFpProvidedLoaded, setIsFpProvidedLoaded] = useState(false);

  useEffect(() => {
    fpProvider
      .load()
      .then(() => {
        setIsFpProvidedLoaded(true);
      })
      .catch(e => {
        const msg = `Error loading Footprint Provider: ${e.message || e}`;
        console.error(msg);
        onError(new TypeError(msg));
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isFpProvidedLoaded || isSdkArgsLoading) {
      return;
    }

    if (querySdkArgs.error) {
      onError(querySdkArgs.error);
    } else if (hasInvalidHashFragment(windowUrl)) {
      onError(new TypeError('Invalid URL fragment'));
    }

    const sdkArgsData = querySdkArgs.isSuccess ? querySdkArgs.data : undefined;
    if (sdkArgsData) {
      onSuccess(sdkArgsData.args.data, sdkArgsData.obConfig);
    }
  }, [isFpProvidedLoaded, windowUrl, isSdkArgsLoading]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useProps;
