import { DEBUG_HANDOFF_URL, IS_DEV } from '@/domains/idv/config/constants';
import { getQueryParams } from '@/utils/url';

import useURL from './use-url';

const useIsDebug = () => {
  const linkingUrl = useURL();
  const debugUrl = IS_DEV ? DEBUG_HANDOFF_URL : undefined;
  const url = debugUrl || linkingUrl;

  let isDebug = false;

  if (url) {
    const params = getQueryParams(url);
    if (params?.debug === 'true') {
      isDebug = true;
    }
  }

  return isDebug;
};

export default useIsDebug;
