import { IdvBootstrapData, IdvOptions } from '@onefootprint/types';
import { useRouter } from 'next/router';

import parseBootstrapData from '../../utils/parse-bootstrap-data';

const FRAGMENT_DIVIDER = '__';

const isOptionsValid = (options: any) =>
  !!options && typeof options === 'object' && options !== null;

const isBootstrapDataValid = (bootstrapData: any) =>
  !!bootstrapData &&
  typeof bootstrapData === 'object' &&
  bootstrapData !== null;

const useBootstrapDataFromUrl = ():
  | undefined
  | {
      bootstrapData: IdvBootstrapData;
      options: IdvOptions;
    } => {
  const router = useRouter();

  if (!router.isReady) {
    return undefined;
  }

  const parts = router.asPath.split('#');
  if (parts.length !== 2) {
    return {
      bootstrapData: {},
      options: {},
    };
  }

  const args = parts[1];
  const argsParts = args.split(FRAGMENT_DIVIDER);

  const stringifiedBootstrapData = argsParts[0];
  const stringifiedOptions = argsParts.length > 1 ? argsParts[1] : '';

  let bootstrapData = {};
  let options = {};
  try {
    const parsedBootstrapData = JSON.parse(
      decodeURIComponent(stringifiedBootstrapData),
    );
    if (isBootstrapDataValid(parsedBootstrapData)) {
      bootstrapData = parsedBootstrapData;
    }
    const parsedOptions = JSON.parse(decodeURIComponent(stringifiedOptions));
    if (isOptionsValid(parsedOptions)) {
      options = parsedOptions;
    }
  } catch (e) {
    return {
      bootstrapData: {},
      options: {},
    };
  }

  return {
    bootstrapData: parseBootstrapData(bootstrapData as IdvBootstrapData),
    options,
  };
};

export default useBootstrapDataFromUrl;
