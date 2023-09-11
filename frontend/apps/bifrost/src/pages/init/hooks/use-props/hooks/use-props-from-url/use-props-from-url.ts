import type { IdvBootstrapData } from '@onefootprint/types';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import type { BifrostProps } from '../../types';
import arePropsValid from '../../utils/are-props-valid';
import getParsedProps from '../../utils/get-parsed-props';
import parseLegacyUserData from '../../utils/parse-legacy-user-data';

const LEGACY_FRAGMENT_DIVIDER = '__';

const usePropsFromUrl = (onSuccess: (props: BifrostProps) => void) => {
  const router = useRouter();

  const getData = () => {
    let params = router.asPath;
    if (router.pathname) {
      const parts = params.split(router.pathname);
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
    if (!arePropsValid(parsedProps)) {
      return undefined;
    }

    return parsedProps;
  };

  const getLegacyData = () => {
    const parts = router.asPath.split('#');
    if (parts.length < 2) {
      return undefined;
    }

    // We expect URLs to be formatted like this:
    // <URL_BASE>#<ENCODED_LEGACY_USER_DATA>__<ENCODED_LEGACY_OPTIONS>
    const args = parts[1];
    const argsParts = args.split(LEGACY_FRAGMENT_DIVIDER);
    const stringifiedUserData = argsParts[0];
    const userData = getParsedProps(stringifiedUserData);
    const stringifiedOptions = argsParts.length > 1 ? argsParts[1] : '';
    const options = getParsedProps(stringifiedOptions);

    return {
      userData: parseLegacyUserData(userData as IdvBootstrapData),
      options,
    };
  };

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const data = getLegacyData() || getData() || {};
    onSuccess(data);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.asPath, router.pathname]);
};

export default usePropsFromUrl;
