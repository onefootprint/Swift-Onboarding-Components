import type { IdvBootstrapData } from '@onefootprint/types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import type { BifrostProps } from '../../types';
import isValidObject from '../../utils/are-props-valid';
import getParsedProps from '../../utils/get-parsed-props';
import parseLegacyUserData from '../../utils/parse-legacy-user-data';

const LEGACY_FRAGMENT_DIVIDER = '__';

/**
 * Extract Bifrost properties from a encoded URL string
 * @param {String} path We expect URLs to be formatted like this: <URL_BASE>#<ENCODED_LEGACY_USER_DATA>__<ENCODED_LEGACY_OPTIONS>__<ENCODED_LEGACY_L10N>
 * @returns {BifrostProps | undefined} BifrostProps | undefined
 */
export const getLegacyData = (path: string): BifrostProps | undefined => {
  const parts = path.split('#');
  if (parts.length < 2) return undefined;

  const args = parts[1];
  const [part1, part2, part3] = args.split(LEGACY_FRAGMENT_DIVIDER);

  return {
    userData: parseLegacyUserData(getParsedProps(part1) as IdvBootstrapData),
    options: getParsedProps(part2 || ''),
    l10n: part3 ? getParsedProps(part3) : undefined,
  };
};

/**
 * Extract Bifrost properties from a URL string (one at the time)
 * It searches for the first "props" query argument and decodes its value before returning it.
 * @param {String} pathname example : pathname/
 * @param {String} fullPath example : http://id.onefootprint.com/path?public_key=123&redirect_url=redirectUrl
 * @returns {BifrostProps | undefined} BifrostProps | undefined
 * @deprecated Not yet in use, we can delete it or implement with unit tests
 */
export const getData = (
  pathname: string,
  fullPath: string,
): BifrostProps | undefined => {
  let params = fullPath;
  if (pathname) {
    const parts = params.split(pathname);
    if (parts.length > 1) {
      [, params] = parts;
    }
  }
  const searchParams = new URLSearchParams(params);
  const props = searchParams.get('props') ?? undefined;
  if (!props) {
    return undefined;
  }

  const parsedProps = getParsedProps(props);
  return isValidObject(parsedProps) ? parsedProps : undefined;
};

const usePropsFromUrl = (onSuccess: (props: BifrostProps) => void): void => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const data =
      getLegacyData(router.asPath) ||
      getData(router.pathname, router.asPath) ||
      ({} as BifrostProps);
    onSuccess(data);
  }, [router.isReady, router.asPath, router.pathname]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default usePropsFromUrl;
