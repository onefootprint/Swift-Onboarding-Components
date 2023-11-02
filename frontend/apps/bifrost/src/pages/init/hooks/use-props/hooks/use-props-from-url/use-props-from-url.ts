import type { IdvBootstrapData } from '@onefootprint/types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import type { BifrostProps } from '../../types';
import getParsedProps from '../../utils/get-parsed-props';
import parseUserData from '../../utils/parse-user-data';

const FRAGMENT_DIVIDER = '__';

/**
 * Extract Bifrost properties from a encoded URL string
 * @param {String} path We expect URLs to be formatted like this: <URL_BASE>#<ENCODED_LEGACY_USER_DATA>__<ENCODED_LEGACY_OPTIONS>__<ENCODED_LEGACY_L10N>
 * @returns {BifrostProps | undefined} BifrostProps | undefined
 */
export const getData = (path: string): BifrostProps | undefined => {
  const parts = path.split('#');
  if (parts.length < 2) return undefined;

  const fragment = parts[1];
  const [part1, part2, part3] = fragment.split(FRAGMENT_DIVIDER);

  return {
    userData: parseUserData(getParsedProps(part1) as IdvBootstrapData),
    options: getParsedProps(part2),
    l10n: getParsedProps(part3),
    authToken: undefined,
  };
};

const usePropsFromUrl = (onSuccess: (props?: BifrostProps) => void): void => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    onSuccess(getData(router.asPath));
  }, [router.isReady, router.asPath, router.pathname]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default usePropsFromUrl;
